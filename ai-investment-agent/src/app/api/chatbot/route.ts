/**
 * /api/chatbot — Streaming chat endpoint powered exclusively by NVIDIA NIM.
 *
 * The assistant acts as an investment-research guide:
 *   • Explains what each agent does (financial scoring, news sentiment, etc.)
 *   • Walks the user through how to use the app
 *   • Answers light questions about investing terminology
 *
 * LLM interaction log (design session):
 * -----------------------------------------------------------
 * [DEV → NVIDIA llama-3.3-70b-instruct]
 * "I'm building an AI Investment Research Agent with 7 LangGraph agents.
 *  I want to add a small floating chatbot that tells users what the app
 *  does and guides them. What system prompt would make it helpful but concise?"
 *
 * [NVIDIA llama-3.3-70b-instruct → DEV]
 * "Keep the system prompt under 200 tokens. Focus it on:
 *  1. Explaining the 7 agents (company research, financial scoring, news
 *     sentiment, risk, bull/bear, analyst memo, recommendation).
 *  2. Guiding users to type a company name in the search bar.
 *  3. Clarifying it only answers app-related and investing-101 questions.
 *  Use a friendly but professional tone — think 'Bloomberg terminal assistant'."
 *
 * [DEV → NVIDIA llama-3.3-70b-instruct]
 * "Should I stream tokens or return full completion for the chat UX?"
 *
 * [NVIDIA llama-3.3-70b-instruct → DEV]
 * "Stream via Server-Sent Events (SSE). It makes the chat feel alive and
 *  reduces perceived latency. Use ReadableStream + TextEncoder on the Next.js
 *  route handler side, and EventSource or fetch+reader on the client."
 * -----------------------------------------------------------
 */

import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct";

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

export async function POST(req: NextRequest) {
  if (!NVIDIA_API_KEY) {
    return NextResponse.json(
      { error: "NVIDIA_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let messages: { role: string; content: string }[];
  try {
    const body = await req.json();
    messages = body.messages ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Build the full message history with our system prompt prepended
  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  // Stream response from NVIDIA NIM
  const nvidiaRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
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

  if (!nvidiaRes.ok) {
    const err = await nvidiaRes.text();
    return NextResponse.json(
      { error: `NVIDIA API error: ${err}` },
      { status: nvidiaRes.status }
    );
  }

  // Pipe the SSE stream straight back to the client
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
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
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
                );
              }
            } catch {
              // skip malformed chunk
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
