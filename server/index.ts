import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import filesRouter from "./routes/files.js";
import mediaRouter from "./routes/media.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);
const MEDIA_ROOT = process.env.MEDIA_ROOT || process.env.HOME || "/";

console.log(`[Server] MEDIA_ROOT: ${MEDIA_ROOT}`);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Make MEDIA_ROOT available to routes
app.locals.mediaRoot = MEDIA_ROOT;

// API Routes
app.use("/api/files", filesRouter);
app.use("/api/media", mediaRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    mediaRoot: MEDIA_ROOT,
  });
});

// Serve static files in production
const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// Error handler
app.use(
  (
    err: Error & { status?: number; statusCode?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[Server] Error:", err.message);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: err.message || "Internal server error",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    Media Explorer                         ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                  ║
║  Media root: ${MEDIA_ROOT.padEnd(42)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received, shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Server] SIGINT received, shutting down...");
  process.exit(0);
});
