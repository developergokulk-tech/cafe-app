import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDriveImageUrl } from "@/lib/imageUtils";
import { bumpMenuVersion } from "@/lib/menuVersion";

export async function GET() {
    try {
        const dishes = await prisma.dish.findMany({
            include: {
                category: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        return NextResponse.json(dishes, {
            headers: {
                "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: error?.message || "Failed to fetch dishes", stack: error?.stack },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        const dish = await prisma.dish.create({
            data: {
                name: body.name,
                categoryId: Number(body.categoryId),
                price: Number(body.price),
                dietary: body.dietary || "veg",
                isBestseller: body.isBestseller || false,
                isSpooky: body.isSpooky || false,
                prepTime: body.prepTime || null,
                calories: body.calories || null,
                imageUrl: body.imageUrl ? formatDriveImageUrl(body.imageUrl) : null,
                available: body.available !== undefined ? body.available : true,
                hasCustomization: body.hasCustomization || false,
                options: body.options || null,
                description: body.description || null,
            },
            include: {
                category: true,
            },
        });

        await bumpMenuVersion();

        return NextResponse.json(dish, { status: 201 });
    } catch (error) {
        console.error("Failed to create dish:", error);

        return NextResponse.json(
            { error: "Failed to create dish" },
            { status: 500 }
        );
    }
}