import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Multi-Device Server In-Memory Cache (Lock 1: 3-second coalesce shield)
let cachedOrdersData = null;
let cachedOrdersEtag = null;
let lastOrdersFetchTime = 0;

export function invalidateOrdersServerCache() {
    lastOrdersFetchTime = 0;
    cachedOrdersData = null;
    cachedOrdersEtag = null;
}

export async function GET(request) {
    try {
        const clientEtag = request?.headers?.get?.("if-none-match");
        const now = Date.now();

        // 1. Serve from server RAM if within 3s (Lock 1: 0ms multi-device shield)
        if (cachedOrdersData && (now - lastOrdersFetchTime < 3000)) {
            if (clientEtag && clientEtag === cachedOrdersEtag) {
                return new Response(null, {
                    status: 304,
                    headers: {
                        "ETag": cachedOrdersEtag,
                        "Cache-Control": "private, no-cache, must-revalidate",
                    },
                });
            }
            return NextResponse.json(cachedOrdersData, {
                headers: {
                    "ETag": cachedOrdersEtag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        // 2. Fetch from Supabase PostgreSQL
        const orders = await prisma.order.findMany({
            include: {
                session: {
                    include: {
                        table: true,
                        customer: true,
                    },
                },
                orderItems: {
                    include: {
                        dish: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 150,
        });

        // Compute fast deterministic ETag fingerprint
        const latestOrder = orders[0];
        const etag = orders.length > 0
            ? `W/"orders-${orders.length}-${latestOrder?.id}-${latestOrder?.status}-${new Date(latestOrder?.createdAt).getTime()}"`
            : 'W/"orders-empty"';

        // Update server cache
        cachedOrdersData = orders;
        cachedOrdersEtag = etag;
        lastOrdersFetchTime = now;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        return NextResponse.json(orders, {
            headers: {
                "ETag": etag,
                "Cache-Control": "private, no-cache, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { tableNumber, items, totalAmount, customerName, customerPhone, sessionId, notes, kitchenNotes, description, specialInstructions } = body;
        const orderNotes = (notes || kitchenNotes || description || specialInstructions || "").toString().trim() || null;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Cart is empty. Please add items to place an order." },
                { status: 400 }
            );
        }

        const validTableNum = Number(tableNumber) || 1;

        // 1. Ensure Table exists
        let table = await prisma.cafeTable.findUnique({
            where: { tableNumber: validTableNum },
        });

        if (!table) {
            table = await prisma.cafeTable.create({
                data: {
                    tableNumber: validTableNum,
                    tableToken: `table-${validTableNum}-${Date.now()}`,
                    status: "OCCUPIED",
                },
            });
        } else if (table.status !== "OCCUPIED") {
            await prisma.cafeTable.update({
                where: { id: table.id },
                data: { status: "OCCUPIED" },
            });
        }

        // 2. Ensure Customer exists
        const phone = (customerPhone || "0000000000").trim();
        const name = (customerName || "Guest Customer").trim();

        let customer = await prisma.customer.findFirst({
            where: { phone },
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name,
                    phone,
                },
            });
        } else if (customerName && customer.name !== name) {
            customer = await prisma.customer.update({
                where: { id: customer.id },
                data: { name },
            });
        }

        // 3. Resolve or Create Active Session (Auto-recovers if previous session ended)
        let session = null;

        if (sessionId) {
            session = await prisma.session.findUnique({
                where: { id: Number(sessionId) },
                include: { table: true, customer: true },
            });
        }

        // If no session, or if session was ended/not active, or belongs to another table:
        if (!session || session.status !== "ACTIVE" || session.tableId !== table.id) {
            session = await prisma.session.findFirst({
                where: {
                    tableId: table.id,
                    customerId: customer.id,
                    status: "ACTIVE",
                },
                include: { table: true, customer: true },
            });

            if (!session) {
                session = await prisma.session.create({
                    data: {
                        tableId: table.id,
                        customerId: customer.id,
                        status: "ACTIVE",
                    },
                    include: { table: true, customer: true },
                });
            }
        }

        // 4. Validate item dish IDs and recalculate total
        const computedTotal = items.reduce((sum, item) => {
            const unitPrice = Number(item.unitPrice ?? item.price ?? item.basePrice ?? 0);
            const qty = Number(item.quantity || 1);
            return sum + unitPrice * qty;
        }, 0);

        // Batch fetch all dishes in one single database query
        const dishIds = items
            .map((item) => Number(item.id || item.dishId))
            .filter((id) => Boolean(id) && !isNaN(id));

        const existingDishes = await prisma.dish.findMany({
            where: { id: { in: dishIds } },
            select: { id: true },
        });
        const existingDishIds = new Set(existingDishes.map((d) => d.id));

        const validOrderItemsData = [];
        for (const item of items) {
            const dishId = Number(item.id || item.dishId);
            if (!existingDishIds.has(dishId)) continue;

            const qty = Number(item.quantity || 1);
            const unitPrice = Number(item.unitPrice ?? item.price ?? item.basePrice ?? 0);
            const subtotal = Number((unitPrice * qty).toFixed(2));

            validOrderItemsData.push({
                dishId: dishId,
                quantity: qty,
                price: unitPrice,
                subtotal: subtotal,
                customizations: item.customizations || null,
            });
        }

        if (validOrderItemsData.length === 0) {
            return NextResponse.json(
                { error: "Selected items are no longer available. Please refresh the menu." },
                { status: 400 }
            );
        }

        const order = await prisma.order.create({
            data: {
                sessionId: session.id,
                totalAmount: computedTotal,
                status: "RECEIVED",
                notes: orderNotes,
                orderItems: {
                    create: validOrderItemsData,
                },
            },
            include: {
                orderItems: {
                    include: {
                        dish: true,
                    },
                },
                session: {
                    include: {
                        table: true,
                        customer: true,
                    },
                },
            },
        });

        // Create alert notification for kitchen & admin
        try {
            await prisma.notification.create({
                data: {
                    tableNumber: validTableNum,
                    message: `New Order placed (₹${computedTotal})`,
                    read: false,
                },
            });
        } catch (notifErr) {
            console.error("Failed to auto-create order notification:", notifErr);
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json(
            { error: "Failed to create order. Please try again." },
            { status: 500 }
        );
    }
}
