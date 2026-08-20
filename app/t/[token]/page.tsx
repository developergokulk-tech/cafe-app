import Menu from "@/components/customer/Menu";
import { prisma } from "@/lib/prisma";
import { getTableNumberFromToken } from "@/lib/tableHashes";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function HashedTableTokenPage({ params }: PageProps) {
  const { token } = await params;

  // 1. Resolve table number instantly from cryptographic hash mapping
  let tableNumber = getTableNumberFromToken(token);

  // 2. Ensure table exists in database as well
  try {
    const tableInDb = await prisma.cafeTable.findFirst({
      where: {
        OR: [
          { tableToken: token },
          { tableNumber: tableNumber },
        ],
      },
    });

    if (tableInDb) {
      tableNumber = tableInDb.tableNumber;
    } else {
      await prisma.cafeTable.create({
        data: {
          tableNumber: tableNumber,
          tableToken: token,
          status: "AVAILABLE",
        },
      });
    }
  } catch (err) {
    console.error("Database table lookup error in /t/[token]:", err);
  }

  return (
    <main className="min-h-screen bg-[#06050A]">
      <Menu tableToken={token} tablenumber={tableNumber} />
    </main>
  );
}
