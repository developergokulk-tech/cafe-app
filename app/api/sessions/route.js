import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions — Create a new customer session
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, phone, tableNumber } = body;

        if (!name || !phone || !tableNumber) {
            return NextResponse.json(
                { error: "Name, phone, and tableNumber are required" },
                { status: 400 }
            );
        }

        // 1. Find or create the table
        let table = await prisma.cafeTable.findUnique({
            where: { tableNumber: Number(tableNumber) },
        });

        if (!table) {
            table = await prisma.cafeTable.create({
                data: {
                    tableNumber: Number(tableNumber),
                    tableToken: `table-${tableNumber}-${Date.now()}`,
                    status: "OCCUPIED",
                },
            });
        } else {
            await prisma.cafeTable.update({
                where: { id: table.id },
                data: { status: "OCCUPIED" },
            });
        }

        // 2. Find or create customer by phone
        let customer = await prisma.customer.findFirst({
            where: { phone: phone },
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: name,
                    phone: phone,
                },
            });
        } else {
            // Update name if it changed
            customer = await prisma.customer.update({
                where: { id: customer.id },
                data: { name: name },
            });
        }

        // 3. Check if there's already an active session for this customer at this table
        let session = await prisma.session.findFirst({
            where: {
                tableId: table.id,
                customerId: customer.id,
                status: "ACTIVE",
            },
        });

        if (!session) {
            session = await prisma.session.create({
                data: {
                    tableId: table.id,
                    customerId: customer.id,
                    status: "ACTIVE",
                },
            });
        }

        return NextResponse.json({
            sessionId: session.id,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            tableNumber: table.tableNumber,
            status: session.status,
        }, { status: 201 });

    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}

// GET /api/sessions — Fetch customer sessions with status and scope filter (default: today only)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const scope = (searchParams.get("scope") || "today").toLowerCase();
        const clientEtag = request?.headers?.get?.("if-none-match");

        let startDate = new Date();
        let endDate = new Date();

        if (scope === "yesterday") {
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (scope === "all") {
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // "today" (default) — strictly current day 00:00:00 → 23:59:59
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        const where = {
            startedAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        if (status) {
            const s = status.toUpperCase();
            // "ended" matches both ENDED (legacy) and COMPLETED (new settle flow)
            if (s === "ENDED") {
                where.status = { in: ["ENDED", "COMPLETED"] };
            } else {
                where.status = s;
            }
        }

        const sessions = await prisma.session.findMany({
            where,
            include: {
                customer: true,
                table: true,
                orders: {
                    include: {
                        orderItems: {
                            include: {
                                dish: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                endedAt: "desc",
            },
        });

        // Compute fast deterministic ETag fingerprint
        const latestSession = sessions[0];
        const etag = sessions.length > 0
            ? `W/"sessions-${scope}-${sessions.length}-${latestSession?.id}-${new Date(latestSession?.endedAt || latestSession?.startedAt).getTime()}"`
            : `W/"sessions-${scope}-empty"`;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        return NextResponse.json(sessions, {
            headers: {
                "ETag": etag,
                "Cache-Control": "private, no-cache, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

// PATCH /api/sessions?id=<id> — Close / complete a session
export async function PATCH(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Session id is required" }, { status: 400 });
        }

        const body = await request.json();
        const { status } = body;

        const updateData = { status: status?.toUpperCase() ?? "COMPLETED" };

        // Set endedAt when completing
        if (updateData.status === "COMPLETED" || updateData.status === "ENDED") {
            updateData.endedAt = new Date();
        }

        const session = await prisma.session.update({
            where: { id: Number(id) },
            data: updateData,
        });

        // Mark table AVAILABLE if no other active sessions remain
        const activeSessionsOnTable = await prisma.session.count({
            where: { tableId: session.tableId, status: "ACTIVE" },
        });
        if (activeSessionsOnTable === 0) {
            await prisma.cafeTable.update({
                where: { id: session.tableId },
                data: { status: "AVAILABLE" },
            });
        }

        return NextResponse.json({ success: true, session });
    } catch (error) {
        console.error("Failed to update session:", error);
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }
}
