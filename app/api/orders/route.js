import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
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
            take: 300,
        });

        return NextResponse.json(orders);
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

        const validOrderItemsData = [];
        for (const item of items) {
            const dishId = Number(item.id || item.dishId);
            const qty = Number(item.quantity || 1);
            const unitPrice = Number(item.unitPrice ?? item.price ?? item.basePrice ?? 0);
            const subtotal = Number((unitPrice * qty).toFixed(2));

            // Verify dish exists in DB
            const dishExists = await prisma.dish.findUnique({
                where: { id: dishId },
            });

            if (dishExists) {
                validOrderItemsData.push({
                    dishId: dishExists.id,
                    quantity: qty,
                    price: unitPrice,
                    subtotal: subtotal,
                    customizations: item.customizations || null,
                });
            }
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

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json(
            { error: "Failed to create order. Please try again." },
            { status: 500 }
        );
    }
}
