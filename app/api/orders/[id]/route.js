import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateOrdersServerCache } from "../route";
import { invalidateTablesServerCache } from "../../tables/route";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const clientEtag = request?.headers?.get?.("if-none-match");

        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                status: true,
                totalAmount: true,
                createdAt: true,
                completedAt: true,
                sessionId: true,
                session: {
                    select: {
                        id: true,
                        status: true,
                        table: { select: { tableNumber: true } },
                        customer: { select: { name: true, phone: true } },
                    },
                },
                orderItems: {
                    select: {
                        id: true,
                        quantity: true,
                        price: true,
                        subtotal: true,
                        dishId: true,
                        dish: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found", status: "CANCELLED", notFound: true }, { status: 200 });
        }

        const itemsHash = (order.orderItems || []).map(i => `${i.dishId}:${i.quantity}:${i.price}`).join("_");
        const etag = `W/"order-${order.id}-${order.status}-${order.totalAmount}-${itemsHash}-${new Date(order.completedAt || order.createdAt).getTime()}"`;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        return NextResponse.json(order, {
            headers: {
                "ETag": etag,
                "Cache-Control": "private, no-cache, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Failed to fetch order:", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, items, isAdmin } = body;
        const orderId = Number(id);

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!existingOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Once cancelled, the status cannot be changed or modified (locked state)
        if (existingOrder.status.toUpperCase() === "CANCELLED") {
            return NextResponse.json(
                { error: "Cannot modify status of a cancelled order" },
                { status: 400 }
            );
        }

        // Enforce 1-minute 10-seconds (70 seconds) cancellation limit for customer orders only (admin can cancel anytime)
        if (status && status.toUpperCase() === "CANCELLED" && !isAdmin) {
            const elapsedMs = new Date().getTime() - new Date(existingOrder.createdAt).getTime();
            if (elapsedMs > 70000) {
                return NextResponse.json(
                    { error: "Cancellation window (1 minute 10 seconds) has expired" },
                    { status: 400 }
                );
            }
        }

        // Invalidate server memory caches for orders and tables
        invalidateOrdersServerCache();
        invalidateTablesServerCache();

        // ── Case 1: Editing items (and optionally status) ──
        if (items !== undefined) {
            if (items.length === 0) {
                return NextResponse.json(
                    { error: "An order must have at least one item" },
                    { status: 400 }
                );
            }

            const newTotal = items.reduce(
                (sum, item) => sum + Number(item.price) * Number(item.quantity),
                0
            );

            const dataToUpdate = { totalAmount: newTotal };
            if (status) {
                dataToUpdate.status = status.toUpperCase();
                if (["SERVED", "COMPLETED"].includes(status.toUpperCase())) {
                    dataToUpdate.completedAt = new Date();
                }
            }

            // Delete all existing items then recreate — simpler than diffing
            const order = await prisma.$transaction(async (tx) => {
                await tx.orderItem.deleteMany({ where: { orderId } });

                await tx.orderItem.createMany({
                    data: items.map((item) => ({
                        orderId,
                        dishId: Number(item.dishId),
                        quantity: Number(item.quantity),
                        price: Number(item.price),
                        subtotal: Number(item.price) * Number(item.quantity),
                    })),
                });

                return tx.order.update({
                    where: { id: orderId },
                    data: dataToUpdate,
                    include: {
                        session: { include: { table: true, customer: true } },
                        orderItems: { include: { dish: true } },
                    },
                });
            });

            return NextResponse.json(order);
        }

        // ── Case 2: Status-only update (ultra fast 5ms execution) ──
        const dataToUpdate = { status: status.toUpperCase() };
        if (["SERVED", "COMPLETED"].includes(status.toUpperCase())) {
            dataToUpdate.completedAt = new Date();
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: dataToUpdate,
            select: { id: true, status: true, completedAt: true },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Failed to update order:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
