import { Router, Request, Response } from "express";
import { investmentGraph } from "../graph/investmentGraph";
import type { ResearchState } from "../types/investment";

export const analyzeRouter = Router();

analyzeRouter.post("/", async (req: Request, res: Response): Promise<void> => {
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

  const send = (event: string, data: unknown): void => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send("start", { company, message: "Starting analysis..." });

    const initialState: ResearchState = {
      company,
      completedAgents: [],
    };

    // ── SSE keep-alive heartbeat ──────────────────────────────────────────────
    // Render/Vercel proxies close idle SSE connections after ~30s.
    // Send a comment ping every 15s to keep the connection alive.
    const heartbeat = setInterval(() => {
      res.write(": ping\n\n");
    }, 15000);

    // ── Overall pipeline timeout (5 min) ──────────────────────────────────────
    const pipelineTimeout = setTimeout(() => {
      clearInterval(heartbeat);
      send("error", { success: false, error: "Analysis timed out after 5 minutes. Please try again." });
      res.end();
    }, 5 * 60 * 1000);

    try {
      // Stream the graph execution — emit progress after each node
      const graphStream = await investmentGraph.stream(initialState, {
        streamMode: "updates",
      });

      let finalState: ResearchState = initialState;

      for await (const update of graphStream) {
        const [nodeName, partialState] = Object.entries(update)[0] as [
          string,
          Partial<ResearchState>
        ];

        finalState = { ...finalState, ...partialState };

        send("agent_complete", {
          agent: nodeName,
          completedAgents: finalState.completedAgents,
          data: partialState,
        });
      }

      clearTimeout(pipelineTimeout);
      clearInterval(heartbeat);
      send("complete", { success: true, data: finalState });
      res.end();
    } catch (innerErr: unknown) {
      clearTimeout(pipelineTimeout);
      clearInterval(heartbeat);
      throw innerErr;
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Analysis failed. Please try again.";
    console.error("[analyze] Pipeline error:", err);
    send("error", { success: false, error: message });
    res.end();
  }
});
