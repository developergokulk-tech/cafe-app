import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/:id — Fetch session with all orders and customer info (with ETag 304 & trimmed select)
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const clientEtag = request?.headers?.get?.("if-none-match");

        const session = await prisma.session.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                status: true,
                startedAt: true,
                endedAt: true,
                customerId: true,
                tableId: true,
                customer: {
                    select: { id: true, name: true, phone: true },
                },
                table: {
                    select: { id: true, tableNumber: true },
                },
                orders: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true,
                        createdAt: true,
                        orderItems: {
                            select: {
                                id: true,
                                quantity: true,
                                price: true,
                                subtotal: true,
                                customizations: true,
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
        });

        if (!session) {
            return NextResponse.json(
                { error: "Session not found", status: "ENDED", notFound: true },
                { status: 200 }
            );
        }

        const latestOrder = session.orders?.[0];
        const etag = `W/"session-${session.id}-${session.status}-${session.orders?.length || 0}-${latestOrder?.status || 'none'}"`;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        return NextResponse.json(session, {
            headers: {
                "ETag": etag,
                "Cache-Control": "private, no-cache, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Failed to fetch session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}

// PATCH /api/sessions/:id — End a session manually
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const dataToUpdate = {};

        if (status === "ENDED") {
            dataToUpdate.status = "ENDED";
            dataToUpdate.endedAt = new Date();
        }

        const session = await prisma.session.update({
            where: { id: Number(id) },
            data: dataToUpdate,
            include: {
                table: true,
                customer: true,
            },
        });

        // If session ended, set the table back to AVAILABLE only if no other active sessions exist on it
        if (status === "ENDED") {
            const activeSessions = await prisma.session.findFirst({
                where: {
                    tableId: session.tableId,
                    status: "ACTIVE",
                },
            });
            if (!activeSessions) {
                await prisma.cafeTable.update({
                    where: { id: session.tableId },
                    data: { status: "AVAILABLE" },
                });
            }
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error("Failed to update session:", error);
        return NextResponse.json(
            { error: "Failed to update session" },
            { status: 500 }
        );
    }
}

// PUT /api/sessions/:id — Edit session orders/items
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const sessionId = Number(id);
        const body = await request.json();
        const { items } = body; // Array of { dishId, quantity, price }

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Items array is required" }, { status: 400 });
        }

        // 1. Verify session exists
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { orders: { where: { status: { not: "cancelled" } } } }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // 2. Determine target order (use existing or create one)
        let targetOrder = session.orders[0];
        if (!targetOrder) {
            targetOrder = await prisma.order.create({
                data: {
                    sessionId,
                    totalAmount: 0,
                    status: "SERVED",
                }
            });
        }

        // 3. Clear existing items for all active orders of this session to avoid duplicates
        const activeOrderIds = session.orders.map(o => o.id);
        if (activeOrderIds.length > 0) {
            await prisma.orderItem.deleteMany({
                where: { orderId: { in: activeOrderIds } }
            });
        }

        // 4. Create new order items for the target order
        let totalAmount = 0;
        const newOrderItems = [];

        for (const item of items) {
            const qty = Number(item.quantity);
            const price = Number(item.price);
            const subtotal = qty * price;
            totalAmount += subtotal;

            newOrderItems.push({
                orderId: targetOrder.id,
                dishId: Number(item.dishId),
                quantity: qty,
                price,
                subtotal,
            });
        }

        // Insert new order items
        if (newOrderItems.length > 0) {
            await prisma.orderItem.createMany({
                data: newOrderItems
            });
        }

        // 5. Update target order's total amount
        await prisma.order.update({
            where: { id: targetOrder.id },
            data: { totalAmount }
        });

        // 6. Delete other extra active orders of this session to keep one consolidated order
        const extraOrderIds = activeOrderIds.filter(id => id !== targetOrder.id);
        if (extraOrderIds.length > 0) {
            await prisma.order.deleteMany({
                where: { id: { in: extraOrderIds } }
            });
        }

        return NextResponse.json({ success: true, totalAmount });
    } catch (error) {
        console.error("Failed to edit session bill:", error);
        return NextResponse.json({ error: "Failed to edit session bill" }, { status: 500 });
    }
}

