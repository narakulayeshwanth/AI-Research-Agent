// Load environment variables from .env before anything else
import "dotenv/config";

import express from "express";
import cors from "cors";
import { analyzeRouter } from "./routes/analyze";
import { chatbotRouter } from "./routes/chatbot";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── CORS ─────────────────────────────────────────────────────────────────────
// Parse ALLOWED_ORIGINS env var (comma-separated list of allowed frontend URLs)
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-investment-agent-backend" });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/analyze", analyzeRouter);
app.use("/api/chatbot", chatbotRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] AI Investment Agent backend running on port ${PORT}`);
  console.log(`[server] Allowed origins: ${allowedOrigins.join(", ")}`);
});

export default app;
