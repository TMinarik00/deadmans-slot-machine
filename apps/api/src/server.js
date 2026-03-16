// Entry point for the Dead Mans Slot Machine API.
// Sets up Express with security middleware, mounts Swagger UI, and starts listening.

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { securityHeaders } from "./middleware/security-headers.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { walletRouter } from "./routes/wallet.js";
import { gameRouter } from "./routes/game.js";
import { profileRouter } from "./routes/profile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(securityHeaders);

// CORS allows our Vue frontend (port 5173) to call this API
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));

// Parse JSON request bodies (limit size to prevent abuse)
app.use(express.json({ limit: "1mb" }));

// Rate limiting on auth endpoints - 10 requests per 15 min per IP
// Prevents brute-force login attempts and reset-password spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
});
app.use("/auth/login", authLimiter);
app.use("/auth/forgot-password", authLimiter);

// --- Routes ---
app.use(healthRouter);
app.use(authRouter);
app.use(walletRouter);
app.use(gameRouter);
app.use(profileRouter);

// Swagger UI - interactive API docs at /docs
const swaggerDoc = YAML.load(join(__dirname, "..", "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// --- Start ---
app.listen(PORT, () => {
  console.log("Dead Mans API running on http://localhost:" + PORT);
  console.log("Swagger docs at http://localhost:" + PORT + "/docs");
});

export default app;
