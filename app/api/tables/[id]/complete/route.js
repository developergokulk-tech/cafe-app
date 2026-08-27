import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateOrdersServerCache } from "../../../orders/route";
import { invalidateTablesServerCache } from "../../../tables/route";

// POST /api/tables/:id/complete — End the active session for a table
export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const tableId = Number(id);

        // Find the active session for this table
        const activeSession = await prisma.session.findFirst({
            where: {
                tableId: tableId,
                status: "ACTIVE",
            },
            include: {
                orders: true,
            },
        });

        if (!activeSession) {
            return NextResponse.json(
                { error: "No active session found for this table" },
                { status: 404 }
            );
        }

        // End the session
        await prisma.session.update({
            where: { id: activeSession.id },
            data: {
                status: "ENDED",
                endedAt: new Date(),
            },
        });

        // Auto-complete all pending/preparing/ready orders for this session
        await prisma.order.updateMany({
            where: {
                sessionId: activeSession.id,
                status: { notIn: ["CANCELLED", "SERVED", "COMPLETED"] },
            },
            data: {
                status: "SERVED",
                completedAt: new Date(),
            },
        });

        // Set the table status back to AVAILABLE
        await prisma.cafeTable.update({
            where: { id: tableId },
            data: { status: "AVAILABLE" },
        });

        // Invalidate caches
        invalidateOrdersServerCache();
        invalidateTablesServerCache();

        return NextResponse.json({
            success: true,
            message: `Session ended for table ${tableId}`,
            sessionId: activeSession.id,
        });
    } catch (error) {
        console.error("Failed to complete table session:", error);
        return NextResponse.json(
            { error: "Failed to complete table session" },
            { status: 500 }
        );
    }
}
