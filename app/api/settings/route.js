import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cgstObj = await prisma.appConfig.findUnique({ where: { key: "cgst_rate" } });
    const sgstObj = await prisma.appConfig.findUnique({ where: { key: "sgst_rate" } });

    return NextResponse.json({
      cgst_rate: cgstObj ? parseFloat(cgstObj.value) : 2.5,
      sgst_rate: sgstObj ? parseFloat(sgstObj.value) : 2.5,
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ cgst_rate: 2.5, sgst_rate: 2.5 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { cgst_rate, sgst_rate } = body;

    const updates = [];

    if (cgst_rate !== undefined) {
      updates.push(
        prisma.appConfig.upsert({
          where: { key: "cgst_rate" },
          update: { value: cgst_rate.toString() },
          create: { key: "cgst_rate", value: cgst_rate.toString() }
        })
      );
    }

    if (sgst_rate !== undefined) {
      updates.push(
        prisma.appConfig.upsert({
          where: { key: "sgst_rate" },
          update: { value: sgst_rate.toString() },
          create: { key: "sgst_rate", value: sgst_rate.toString() }
        })
      );
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
