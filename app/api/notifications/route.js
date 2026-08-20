import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// In-memory global array to keep track of active notifications
let notifications = [];

export async function GET() {
    try {
        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
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

        const newNotification = {
            id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 7),
            tableNumber: Number(tableNumber),
            message,
            createdAt: new Date().toISOString(),
        };

        // Prepend so that newest show first
        notifications.unshift(newNotification);

        return NextResponse.json(newNotification, { status: 201 });
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

        if (!id) {
            return NextResponse.json(
                { error: "Missing notification id" },
                { status: 400 }
            );
        }

        notifications = notifications.filter((notif) => notif.id !== id);

        return NextResponse.json({ success: true, message: "Notification dismissed" });
    } catch (error) {
        console.error("Failed to delete notification:", error);
        return NextResponse.json(
            { error: "Failed to delete notification" },
            { status: 500 }
        );
    }
}
