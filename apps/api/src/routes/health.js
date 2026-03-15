// Health check route.
// Returns API status + whether the database is reachable.
// The CTO reviewer can hit GET /health to verify the stack is alive.

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  let dbStatus = "connected";

  try {
    // A quick query to verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "disconnected";
  }

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});
