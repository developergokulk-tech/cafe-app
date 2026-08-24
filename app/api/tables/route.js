import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tables — Fetch all tables with their active sessions and orders
export async function GET(request) {
    try {
        const clientEtag = request?.headers?.get?.("if-none-match");

        const tables = await prisma.cafeTable.findMany({
            include: {
                sessions: {
                    where: { status: "ACTIVE" },
                    include: {
                        customer: true,
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
                },
            },
            orderBy: {
                tableNumber: "asc",
            },
        });

        // Compute fast deterministic ETag fingerprint for tables
        const activeCount = tables.reduce((acc, t) => acc + (t.sessions?.length || 0), 0);
        const etag = `W/"tables-${tables.length}-${activeCount}"`;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "private, no-cache, must-revalidate",
                },
            });
        }

        return NextResponse.json(tables, {
            headers: {
                "ETag": etag,
                "Cache-Control": "private, no-cache, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Failed to fetch tables:", error);
        return NextResponse.json(
            { error: "Failed to fetch tables" },
            { status: 500 }
        );
    }
}

// POST /api/tables — Create a new table
export async function POST(request) {
    try {
        const body = await request.json();
        const tableNumber = Number(body.tableNumber);

        if (!tableNumber || isNaN(tableNumber) || tableNumber <= 0) {
            return NextResponse.json(
                { error: "Valid positive table number is required" },
                { status: 400 }
            );
        }

        const existing = await prisma.cafeTable.findUnique({
            where: { tableNumber },
        });

        if (existing) {
            return NextResponse.json(
                { error: `Table ${tableNumber} already exists` },
                { status: 400 }
            );
        }

        const tableToken = `table-${tableNumber}-${Date.now()}`;
        const newTable = await prisma.cafeTable.create({
            data: {
                tableNumber,
                tableToken,
                status: "AVAILABLE",
            },
        });

        return NextResponse.json(newTable, { status: 201 });
    } catch (error) {
        console.error("Failed to create table:", error);
        return NextResponse.json(
            { error: "Failed to create table" },
            { status: 500 }
        );
    }
}
