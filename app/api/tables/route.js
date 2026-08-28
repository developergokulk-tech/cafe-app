export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Multi-Device Server In-Memory Cache (Lock 1: 3-second coalesce shield)
let cachedTablesData = null;
let cachedTablesEtag = null;
let lastTablesFetchTime = 0;

export function invalidateTablesServerCache() {
    lastTablesFetchTime = 0;
    cachedTablesData = null;
    cachedTablesEtag = null;
}

// GET /api/tables — Fetch all tables with their active sessions and orders
export async function GET(request) {
    try {
        const clientEtag = request?.headers?.get?.("if-none-match");
        const now = Date.now();

        // 1. Serve from server RAM if within 3s (Lock 1: 0ms multi-device shield)
        if (cachedTablesData && (now - lastTablesFetchTime < 3000)) {
            if (clientEtag && clientEtag === cachedTablesEtag) {
                return new Response(null, {
                    status: 304,
                    headers: {
                        "ETag": cachedTablesEtag,
                        "Cache-Control": "private, no-cache, must-revalidate",
                    },
                });
            }
            return NextResponse.json(cachedTablesData, {
                headers: {
                    "ETag": cachedTablesEtag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        // 2. Fetch from Supabase PostgreSQL (trimmed select)
        const tables = await prisma.cafeTable.findMany({
            include: {
                sessions: {
                    where: { status: "ACTIVE" },
                    include: {
                        customer: {
                            select: { id: true, name: true, phone: true },
                        },
                        orders: {
                            include: {
                                orderItems: {
                                    include: {
                                        dish: {
                                            select: { id: true, name: true, price: true },
                                        },
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        },
                    },
                },
            },
            orderBy: {
                tableNumber: "asc",
            },
        });

        // Compute fast deterministic ETag fingerprint for tables
        let rawFingerprint = "";
        for (const t of tables) {
            rawFingerprint += `${t.id}:${t.tableNumber}:${t.status};`;
            for (const s of (t.sessions || [])) {
                rawFingerprint += `s${s.id}:${s.status};`;
                for (const o of (s.orders || [])) {
                    rawFingerprint += `o${o.id}:${o.status}:${o.totalAmount};`;
                }
            }
        }
        const etag = `W/"tables-${tables.length}-${Buffer.from(rawFingerprint).toString("base64").slice(0, 40)}"`;

        // Update server cache
        cachedTablesData = tables;
        cachedTablesEtag = etag;
        lastTablesFetchTime = now;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        return NextResponse.json(tables, {
            headers: {
                "ETag": etag,
                "Cache-Control": "private, no-cache, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Failed to fetch tables:", error);
        return NextResponse.json(
            { error: "Failed to fetch tables" },
            { status: 500 }
        );
    }
}

// POST /api/tables — Create a new table
export async function POST(request) {
    try {
        const body = await request.json();
        const tableNumber = Number(body.tableNumber);

        if (!tableNumber || isNaN(tableNumber) || tableNumber <= 0) {
            return NextResponse.json(
                { error: "Valid positive table number is required" },
                { status: 400 }
            );
        }

        const existing = await prisma.cafeTable.findUnique({
            where: { tableNumber },
        });

        if (existing) {
            return NextResponse.json(
                { error: `Table ${tableNumber} already exists` },
                { status: 400 }
            );
        }

        const tableToken = `table-${tableNumber}-${Date.now()}`;
        const newTable = await prisma.cafeTable.create({
            data: {
                tableNumber,
                tableToken,
                status: "AVAILABLE",
            },
        });

        return NextResponse.json(newTable, { status: 201 });
    } catch (error) {
        console.error("Failed to create table:", error);
        return NextResponse.json(
            { error: "Failed to create table" },
            { status: 500 }
        );
    }
}
