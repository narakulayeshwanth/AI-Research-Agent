"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRouter = void 0;
const express_1 = require("express");
const investmentGraph_1 = require("../graph/investmentGraph");
exports.analyzeRouter = (0, express_1.Router)();
exports.analyzeRouter.post("/", async (req, res) => {
    const company = (req.body?.company ?? "").trim();
    if (!company || company.length < 1) {
        res.status(400).json({ success: false, error: "Company name is required." });
        return;
    }
    if (company.length > 100) {
        res.status(400).json({ success: false, error: "Company name too long." });
        return;
    }
    // ── SSE headers ────────────────────────────────────────────────────────────
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    const send = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    try {
        send("start", { company, message: "Starting analysis..." });
        const initialState = {
            company,
            completedAgents: [],
        };
        // Stream the graph execution — emit progress after each node
        const graphStream = await investmentGraph_1.investmentGraph.stream(initialState, {
            streamMode: "updates",
        });
        let finalState = initialState;
        for await (const update of graphStream) {
            const [nodeName, partialState] = Object.entries(update)[0];
            finalState = { ...finalState, ...partialState };
            send("agent_complete", {
                agent: nodeName,
                completedAgents: finalState.completedAgents,
                data: partialState,
            });
        }
        send("complete", { success: true, data: finalState });
        res.end();
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
        send("error", { success: false, error: message });
        res.end();
    }
});
//# sourceMappingURL=analyze.js.map