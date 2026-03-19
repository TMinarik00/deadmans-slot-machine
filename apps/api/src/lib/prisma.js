// Shared Prisma client instance.
// We create ONE client and reuse it everywhere to avoid
// opening too many database connections.

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
