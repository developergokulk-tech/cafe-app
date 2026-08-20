import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis;

const pool =
    globalForPrisma.pgPoolLatest ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: process.env.NODE_ENV === "production" ? 1 : 2,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPoolLatest = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
    (globalForPrisma.prismaClientLatest?.notification ? globalForPrisma.prismaClientLatest : null) ??
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaClientLatest = prisma;
}