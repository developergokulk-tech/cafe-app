import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        return NextResponse.json(dishes);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to fetch dishes" },
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
                imageUrl: body.imageUrl || null,
                available: body.available !== undefined ? body.available : true,
                hasCustomization: body.hasCustomization || false,
                options: body.options || null,
                description: body.description || null,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(dish, { status: 201 });
    } catch (error) {
        console.error("Failed to create dish:", error);

        return NextResponse.json(
            { error: "Failed to create dish" },
            { status: 500 }
        );
    }
}