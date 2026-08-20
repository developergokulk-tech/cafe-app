import Menu from "@/components/customer/Menu";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function HashedTableTokenPage({ params }: PageProps) {
  const { token } = await params;

  let table = null;

  try {
    // 1. Strict lookup by cryptographic secret token
    table = await prisma.cafeTable.findFirst({
      where: { tableToken: token },
    });

    // 2. Fallback: if token is numeric, check tableNumber
    if (!table && !isNaN(Number(token))) {
      table = await prisma.cafeTable.findUnique({
        where: { tableNumber: Number(token) },
      });
    }
  } catch (err) {
    console.error("Failed to lookup table by token:", err);
  }

  if (!table) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#06050A]">
      <Menu tableToken={token} tablenumber={table.tableNumber} />
    </main>
  );
}
