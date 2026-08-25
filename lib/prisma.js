import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis;

// Lean serverless connection pool (max 1 connection per instance to stay safely below Supabase 15 limit)
const pool =
    globalForPrisma.pgPoolLatest ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 3000,
        allowExitOnIdle: true,
    });

globalForPrisma.pgPoolLatest = pool;

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prismaClient_v3 ??
    new PrismaClient({
        adapter,
    });

globalForPrisma.prismaClient_v3 = prisma;