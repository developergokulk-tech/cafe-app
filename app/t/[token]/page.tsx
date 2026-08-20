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

    // 2. Fallback: Parse table number from tokens like "t_2", "table-2", "t-2", or plain "2"
    if (!table) {
      const match = token.match(/^(?:t_|table[_-]|t-)?(\d+)/i);
      const parsedNum = match && match[1] ? Number(match[1]) : (!isNaN(Number(token)) ? Number(token) : null);

      if (parsedNum && parsedNum > 0) {
        table = await prisma.cafeTable.findUnique({
          where: { tableNumber: parsedNum },
        });

        // If table doesn't exist in DB yet, auto-create it with this token
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
