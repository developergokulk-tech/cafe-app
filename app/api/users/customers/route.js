import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        sessions: {
          include: {
            table: true,
            orders: {
              include: {
                orderItems: {
                  include: {
                    dish: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            startedAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = customers.map((c) => {
      const allOrders = c.sessions.flatMap((s) => s.orders || []);
      const activeOrders = allOrders.filter(
        (o) => (o.status || "").toUpperCase() !== "CANCELLED"
      );
      const totalSpent = activeOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount || 0),
        0
      );
      const totalSessions = c.sessions.length;
      const lastVisit = c.sessions.length > 0 ? c.sessions[0].startedAt : c.createdAt;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        createdAt: c.createdAt,
        totalSessions,
        totalOrders: activeOrders.length,
        totalSpent,
        lastVisit,
        sessions: c.sessions,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
