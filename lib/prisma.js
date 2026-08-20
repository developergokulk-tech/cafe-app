import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis;

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

export const prisma =
    globalForPrisma.prismaClientLatest ??
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaClientLatest = prisma;
}
// Client updated: 2026-08-20