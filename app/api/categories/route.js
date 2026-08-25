import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-Memory Server Cache for Categories (1-minute RAM cache)
let cachedCategoriesData = null;
let cachedCategoriesEtag = null;
let lastCategoriesFetchTime = 0;

export function invalidateCategoriesServerCache() {
    lastCategoriesFetchTime = 0;
    cachedCategoriesData = null;
    cachedCategoriesEtag = null;
}

export async function GET(request) {
    try {
        const clientEtag = request?.headers?.get?.("if-none-match");
        const now = Date.now();

        // 1. Serve from server RAM if within 60s
        if (cachedCategoriesData && (now - lastCategoriesFetchTime < 60000)) {
            if (clientEtag && clientEtag === cachedCategoriesEtag) {
                return new Response(null, {
                    status: 304,
                    headers: {
                        "ETag": cachedCategoriesEtag,
                        "Cache-Control": "public, max-age=60, must-revalidate",
                    },
                });
            }
            return NextResponse.json(cachedCategoriesData, {
                headers: {
                    "ETag": cachedCategoriesEtag,
                    "Cache-Control": "public, max-age=60, must-revalidate",
                },
            });
        }

        // 2. Fetch from database
        const categories = await prisma.category.findMany({
            orderBy: {
                id: "asc",
            },
        });

        const etag = `W/"categories-${categories.length}"`;
        cachedCategoriesData = categories;
        cachedCategoriesEtag = etag;
        lastCategoriesFetchTime = now;

        if (clientEtag && clientEtag === etag) {
            return new Response(null, {
                status: 304,
                headers: {
                    "ETag": etag,
                    "Cache-Control": "public, max-age=60, must-revalidate",
                },
            });
        }

        return NextResponse.json(categories, {
            headers: {
                "ETag": etag,
                "Cache-Control": "public, max-age=60, must-revalidate",
            },
        });
    } catch (error) {
        console.error("GET /api/categories error:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories", details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { name } = await request.json();
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        const category = await prisma.category.create({
            data: { name: name.trim() },
        });
        invalidateCategoriesServerCache();
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get("id"));
        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }
        await prisma.category.delete({ where: { id } });
        invalidateCategoriesServerCache();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        );
    }
}
