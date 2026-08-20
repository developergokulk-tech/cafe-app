import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/tables/:id — Delete a table by ID
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const tableId = Number(id);

        if (!tableId || isNaN(tableId)) {
            return NextResponse.json(
                { error: "Invalid table ID" },
                { status: 400 }
            );
        }

        // Check if table exists
        const table = await prisma.cafeTable.findUnique({
            where: { id: tableId },
            include: {
                sessions: {
                    where: { status: "ACTIVE" },
                },
            },
        });

        if (!table) {
            return NextResponse.json(
                { error: "Table not found" },
                { status: 404 }
            );
        }

        // Check if table has active session
        if (table.sessions && table.sessions.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete table with active session. Complete or end session first." },
                { status: 400 }
            );
        }

        // Clean up ended/inactive sessions and orders for this table if any
        const sessions = await prisma.session.findMany({
            where: { tableId: tableId },
            select: { id: true },
        });
        const sessionIds = sessions.map((s) => s.id);

        if (sessionIds.length > 0) {
            const orders = await prisma.order.findMany({
                where: { sessionId: { in: sessionIds } },
                select: { id: true },
            });
            const orderIds = orders.map((o) => o.id);

            if (orderIds.length > 0) {
                await prisma.orderItem.deleteMany({
                    where: { orderId: { in: orderIds } },
                });
                await prisma.order.deleteMany({
                    where: { id: { in: orderIds } },
                });
            }

            await prisma.session.deleteMany({
                where: { id: { in: sessionIds } },
            });
        }

        // Delete table record
        await prisma.cafeTable.delete({
            where: { id: tableId },
        });

        return NextResponse.json({
            success: true,
            message: `Table ${table.tableNumber} deleted successfully`,
        });
    } catch (error) {
        console.error("Failed to delete table:", error);
        return NextResponse.json(
            { error: "Failed to delete table" },
            { status: 500 }
        );
    }
}
