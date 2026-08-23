import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { key: "menu_version" },
      select: { value: true },
    });

    const version = config?.value || "1";

    return NextResponse.json(
      { version },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ version: Date.now().toString() });
  }
}
