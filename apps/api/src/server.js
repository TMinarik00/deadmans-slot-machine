// Entry point for the Vockice API server.
// Sets up Express with security middleware (Helmet, CORS),
// mounts Swagger UI for interactive API docs, and starts listening.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { healthRouter } from "./routes/health.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Helmet sets security HTTP headers (X-Content-Type-Options, etc.)
app.use(
  helmet({
    contentSecurityPolicy: false, // disabled so Swagger UI can load its assets
  })
);

// CORS allows our Vue frontend (port 5173) to call this API
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// --- Swagger UI ---
// Serves interactive API docs at /docs from our OpenAPI spec file
const swaggerDoc = YAML.load(join(__dirname, "..", "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// --- Routes ---
app.use(healthRouter);

// --- Start ---
app.listen(PORT, () => {
  console.log(`🤠 Vockice API running on http://localhost:${PORT}`);
  console.log(`📜 Swagger docs at http://localhost:${PORT}/docs`);
});

export default app;
