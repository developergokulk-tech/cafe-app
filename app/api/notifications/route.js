import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Multi-Device Server In-Memory Cache (Lock 1: 3-second coalesce shield)
let cachedNotifsData = null;
let cachedNotifsEtag = null;
let lastNotifsFetchTime = 0;

export function invalidateNotifsServerCache() {
    lastNotifsFetchTime = 0;
    cachedNotifsData = null;
    cachedNotifsEtag = null;
}

export async function GET(request) {
    try {
        if (!prisma.notification) {
            return NextResponse.json([]);
        }

        const clientEtag = request?.headers?.get?.("if-none-match");
        const now = Date.now();

        // 1. Serve from server RAM if within 3s (Lock 1: 0ms multi-device shield)
        if (cachedNotifsData && (now - lastNotifsFetchTime < 3000)) {
            if (clientEtag && clientEtag === cachedNotifsEtag) {
                return new Response(null, {
                    status: 304,
                    headers: {
                        "ETag": cachedNotifsEtag,
                        "Cache-Control": "private, no-cache, must-revalidate",
                    },
                });
            }
            return NextResponse.json(cachedNotifsData, {
                headers: {
                    "ETag": cachedNotifsEtag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        // 2. Fetch from Supabase PostgreSQL
        const notifications = await prisma.notification.findMany({
            where: { read: false },
            orderBy: { createdAt: "desc" },
            take: 30,
        });

        const formatted = notifications.map((n) => ({
            id: n.id.toString(),
            tableNumber: n.tableNumber,
            message: n.message,
            createdAt: n.createdAt.toISOString(),
        }));

        // Compute fast deterministic ETag fingerprint for notifications
        const latest = formatted[0];
        const etag = formatted.length > 0
            ? `W/"notifs-${formatted.length}-${latest?.id}"`
            : 'W/"notifs-empty"';

        // Update server cache
        cachedNotifsData = formatted;
        cachedNotifsEtag = etag;
        lastNotifsFetchTime = now;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        return NextResponse.json(formatted, {
            headers: {
                "ETag": etag,
                "Cache-Control": "private, no-cache, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json([]);
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { tableNumber, message } = body;

        const tblNum = Number(tableNumber || 1);
        const msg = String(message || "Service Assistance Requested").trim();

        invalidateNotifsServerCache();

        if (!prisma.notification) {
            return NextResponse.json({
                id: Date.now().toString(),
                tableNumber: tblNum,
                message: msg,
                createdAt: new Date().toISOString(),
            }, { status: 201 });
        }

        const notification = await prisma.notification.create({
            data: {
                tableNumber: isNaN(tblNum) ? 1 : tblNum,
                message: msg,
                read: false,
            },
        });

        const formatted = {
            id: notification.id.toString(),
            tableNumber: notification.tableNumber,
            message: notification.message,
            createdAt: notification.createdAt.toISOString(),
        };

        return NextResponse.json(formatted, { status: 201 });
    } catch (error) {
        console.error("Failed to create notification:", error);
        return NextResponse.json(
            { error: "Failed to create notification" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        invalidateNotifsServerCache();

        if (!id || id === "all") {
            if (prisma.notification) {
                await prisma.notification.updateMany({
                    where: { read: false },
                    data: { read: true },
                });
            }
            return NextResponse.json({ success: true, clearedAll: true });
        }

        if (prisma.notification) {
            const numId = Number(id);
            if (!isNaN(numId)) {
                await prisma.notification.updateMany({
                    where: { id: numId },
                    data: { read: true },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to dismiss notification:", error);
        return NextResponse.json(
            { error: "Failed to dismiss notification" },
            { status: 500 }
        );
    }
}
