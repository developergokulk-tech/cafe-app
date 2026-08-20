import Menu from "@/components/customer/Menu";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ tableNumber: string }>;
  searchParams?: Promise<{ token?: string }>;
}

export default async function DynamicTablePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  // Extract table number dynamically from route (e.g. /table/1 -> 1, /table/2 -> 2)
  const tablenumber = Number(resolvedParams?.tableNumber) || 1;
  const tableToken = resolvedSearchParams?.token || "";

  // Auto-ensure table exists in DB so it shows up in admin Table Overview immediately
  try {
    const existing = await prisma.cafeTable.findUnique({
      where: { tableNumber: tablenumber },
    });
    if (!existing) {
      await prisma.cafeTable.create({
        data: {
          tableNumber: tablenumber,
          tableToken: `table-${tablenumber}-${Date.now()}`,
          status: "AVAILABLE",
        },
      });
    }
  } catch (err) {
    console.error("Auto table creation error:", err);
  }

  return <Menu tableToken={tableToken} tablenumber={tablenumber} />;
}

