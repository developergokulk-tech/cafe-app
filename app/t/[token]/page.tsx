import Menu from "@/components/customer/Menu";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function HashedTableTokenPage({ params }: PageProps) {
  const { token } = await params;

  let tableNumber = 1;

  try {
    // 1. Try finding table by exact secret tableToken
    let table = await prisma.cafeTable.findFirst({
      where: { tableToken: token },
    });

    // 2. Fallback: if token is numeric, lookup by tableNumber
    if (!table && !isNaN(Number(token))) {
      table = await prisma.cafeTable.findUnique({
        where: { tableNumber: Number(token) },
      });
    }

    if (table) {
      tableNumber = table.tableNumber;
    } else {
      // If numeric but doesn't exist, create it
      const num = Number(token);
      if (!isNaN(num) && num > 0) {
        const created = await prisma.cafeTable.create({
          data: {
            tableNumber: num,
            tableToken: `t_${num}_${Math.random().toString(36).substring(2, 8)}`,
            status: "AVAILABLE",
          },
        });
        tableNumber = created.tableNumber;
      } else {
        notFound();
      }
    }
  } catch (err) {
    console.error("Failed to lookup table by token:", err);
  }

  return (
    <main className="min-h-screen bg-[#06050A]">
      <Menu tableToken={token} tablenumber={tableNumber} />
    </main>
  );
}
