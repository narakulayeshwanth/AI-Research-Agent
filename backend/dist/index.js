"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const analyze_1 = require("./routes/analyze");
const chatbot_1 = require("./routes/chatbot");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3001;
// ── CORS ─────────────────────────────────────────────────────────────────────
// Parse ALLOWED_ORIGINS env var (comma-separated list of allowed frontend URLs)
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Render health checks)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "ai-investment-agent-backend" });
});
// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/analyze", analyze_1.analyzeRouter);
app.use("/api/chatbot", chatbot_1.chatbotRouter);
// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});
// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[server] AI Investment Agent backend running on port ${PORT}`);
    console.log(`[server] Allowed origins: ${allowedOrigins.join(", ")}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map