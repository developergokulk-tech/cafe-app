import Menu from "@/components/customer/Menu";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function HashedTableTokenPage({ params }: PageProps) {
  const { token } = await params;

  let tableNumber = 1;

  try {
    // 1. Try finding table by exact tableToken in DB
    let table = await prisma.cafeTable.findFirst({
      where: { tableToken: token },
    });

    // 2. Fallback: Parse table number if token is numeric or contains table prefix (e.g. "1", "t1", "table1", "table-1")
    if (!table) {
      const match = token.match(/^(?:t_|table[_-]?|t-?)?(\d+)/i);
      const parsedNum = match && match[1] ? Number(match[1]) : (!isNaN(Number(token)) ? Number(token) : null);

      if (parsedNum && parsedNum > 0) {
        table = await prisma.cafeTable.findUnique({
          where: { tableNumber: parsedNum },
        });

        // Auto-create table in DB if missing
        if (!table) {
          table = await prisma.cafeTable.create({
            data: {
              tableNumber: parsedNum,
              tableToken: token,
              status: "AVAILABLE",
            },
          });
        }
      }
    }

    if (table) {
      tableNumber = table.tableNumber;
    } else {
      // 3. Fallback: Lookup first available table in DB
      const firstTable = await prisma.cafeTable.findFirst({
        orderBy: { tableNumber: "asc" },
      });
      if (firstTable) {
        tableNumber = firstTable.tableNumber;
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
