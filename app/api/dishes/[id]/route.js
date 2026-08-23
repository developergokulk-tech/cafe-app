import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDriveImageUrl } from "@/lib/imageUtils";
import { bumpMenuVersion } from "@/lib/menuVersion";

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const dish = await prisma.dish.update({
            where: { id: Number(id) },
            data: {
                name: body.name,
                categoryId: Number(body.categoryId),
                price: Number(body.price),
                dietary: body.dietary,
                isBestseller: body.isBestseller,
                isSpooky: body.isSpooky || false,
                prepTime: body.prepTime || null,
                calories: body.calories || null,
                imageUrl: body.imageUrl ? formatDriveImageUrl(body.imageUrl) : null,
                available: body.available,
                hasCustomization: body.hasCustomization || false,
                options: body.options || null,
                description: body.description || null,
            },
            include: {
                category: true,
            },
        });

        await bumpMenuVersion();

        return NextResponse.json(dish);
    } catch (error) {
        console.error("Failed to update dish:", error);

        return NextResponse.json(
            { error: "Failed to update dish" },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const dishId = Number(id);

        if (!dishId || isNaN(dishId)) {
            return NextResponse.json({ error: "Invalid dish ID" }, { status: 400 });
        }

        const updateData = {};
        if (body.available !== undefined) {
            updateData.available = Boolean(body.available);
        }
        if (body.name !== undefined) updateData.name = body.name;
        if (body.price !== undefined) updateData.price = Number(body.price);
        if (body.categoryId !== undefined) updateData.categoryId = Number(body.categoryId);
        if (body.dietary !== undefined) updateData.dietary = body.dietary;
        if (body.isBestseller !== undefined) updateData.isBestseller = Boolean(body.isBestseller);
        if (body.isSpooky !== undefined) updateData.isSpooky = Boolean(body.isSpooky);

        const dish = await prisma.dish.update({
            where: { id: dishId },
            data: Object.keys(updateData).length > 0 ? updateData : body,
            select: { id: true, available: true, name: true },
        });

        await bumpMenuVersion();

        return NextResponse.json(dish);
    } catch (error) {
        console.error("Failed to patch dish:", error);

        return NextResponse.json(
            { error: error?.message || "Failed to patch dish" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const dishId = Number(id);

        // Must delete related OrderItems first to avoid FK constraint errors
        await prisma.$transaction([
            prisma.orderItem.deleteMany({ where: { dishId } }),
            prisma.dish.delete({ where: { id: dishId } }),
        ]);

        await bumpMenuVersion();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete dish:", error);

        return NextResponse.json(
            { error: "Failed to delete dish" },
            { status: 500 }
        );
    }
}
