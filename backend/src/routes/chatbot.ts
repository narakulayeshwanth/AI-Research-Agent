import { Router, Request, Response } from "express";

export const chatbotRouter = Router();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct";

const SYSTEM_PROMPT = `You are InvestBot, the friendly AI assistant for the AI Investment Research Agent — an app that automatically researches any public company and gives a professional INVEST, HOLD, or PASS recommendation.

The app runs 7 specialized AI agents:
1. 📊 Company Research — fetches fundamentals from Yahoo Finance & Alpha Vantage
2. 💹 Financial Scoring — grades growth, profitability & valuation (0-100)
3. 📰 News Sentiment — classifies recent headlines as positive/negative
4. 🛡️ Risk Assessment — rates 5 risk dimensions (industry, competition, regulatory, etc.)
5. 🐂🐻 Bull vs Bear — surfaces evidence-backed arguments on both sides
6. 📝 Analyst Memo — writes a professional equity research report
7. ✅ Recommendation Engine — synthesizes everything into INVEST / HOLD / PASS

How to use: simply type a company name (e.g. "Apple", "Tesla", "Nvidia") in the search bar and press Analyze.

You answer questions about how the app works, investing terminology (PE ratio, EPS, market cap, etc.), and how to interpret the results. Keep answers concise (2-4 sentences max). If asked something unrelated to investing or the app, politely redirect.`;

chatbotRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  if (!NVIDIA_API_KEY) {
    res
      .status(500)
      .json({ error: "NVIDIA_API_KEY is not configured on the server." });
    return;
  }

  const messages: { role: string; content: string }[] =
    req.body?.messages ?? [];

  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  // ── Proxy streaming request to NVIDIA NIM ─────────────────────────────────
  let nvidiaRes: globalThis.Response;
  try {
    nvidiaRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: fullMessages,
        temperature: 0.6,
        max_tokens: 400,
        stream: true,
      }),
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to reach NVIDIA API." });
    return;
  }

  if (!nvidiaRes.ok) {
    const errText = await nvidiaRes.text();
    res
      .status(nvidiaRes.status)
      .json({ error: `NVIDIA API error: ${errText}` });
    return;
  }

  // ── SSE headers ────────────────────────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // ── Pipe NVIDIA SSE stream → client ───────────────────────────────────────
  const reader = nvidiaRes.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);

        if (payload === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
          }
        } catch {
          // skip malformed chunk
        }
      }
    }
  } finally {
    reader.releaseLock();
    res.end();
  }
});
