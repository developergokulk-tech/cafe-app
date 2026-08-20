import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!prisma.notification) {
            return NextResponse.json([]);
        }

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

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json([]);
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { tableNumber, message } = body;

        if (!tableNumber || !message) {
            return NextResponse.json(
                { error: "Missing tableNumber or message" },
                { status: 400 }
            );
        }

        const notification = await prisma.notification.create({
            data: {
                tableNumber: Number(tableNumber),
                message: String(message).trim(),
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
            { error: "Failed to create notification", message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Missing notification id" },
                { status: 400 }
            );
        }

        await prisma.notification.updateMany({
            where: { id: Number(id) },
            data: { read: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to dismiss notification:", error);
        return NextResponse.json(
            { error: "Failed to dismiss notification" },
            { status: 500 }
        );
    }
}
