import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis;

// Persistent connection pool across all Next.js environments (stops connect/terminate churn)
const pool =
    globalForPrisma.pgPoolLatest ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

globalForPrisma.pgPoolLatest = pool;

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prismaClient_v3 ??
    new PrismaClient({
        adapter,
    });

globalForPrisma.prismaClient_v3 = prisma;