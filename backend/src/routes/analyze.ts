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

    send("complete", { success: true, data: finalState });
    res.end();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Analysis failed. Please try again.";
    send("error", { success: false, error: message });
    res.end();
  }
});
