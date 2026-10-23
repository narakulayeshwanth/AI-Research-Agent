/**
 * LLM provider — NVIDIA NIM (primary) → Groq (secondary) → OpenAI (tertiary fallback).
 * Groq free tier: 30 req/min, fast inference (~1-3s), no billing needed.
 *
 * Groq strategy:
 *   1. Try withStructuredOutput (tool/json-schema mode)
 *   2. If model returns "Failed to generate JSON", retry with manual prompt + JSON extraction
 */
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

/** Hard timeout wrapper — rejects if promise doesn't resolve within ms */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[LLM] ${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/** Returns true if the error is a permanent quota/billing failure */
function isQuotaExhausted(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? "").toLowerCase();
  return (
    msg.includes("insufficient_quota") ||
    msg.includes("exceeded your current quota") ||
    msg.includes("billing") ||
    msg.includes("no credits") ||
    msg.includes("account is not active")
  );
}

/** Returns true if Groq rejected the schema-mode JSON generation */
function isGroqJsonSchemaFailure(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? "").toLowerCase();
  return msg.includes("failed to generate json") || msg.includes("failed_generation");
}

/**
 * Manual JSON extraction for Groq models that don't support strict schema mode.
 * Sends a plain prompt with explicit JSON instructions, then parses the response.
 */
async function invokeGroqManualJSON(
  groq: ChatGroq,
  prompt: string,
): Promise<unknown> {
  const jsonPrompt =
    `${prompt}\n\n` +
    `IMPORTANT: Respond with ONLY a raw JSON object — no markdown, no code fences, no explanation.\n` +
    `Start your response with { and end with }.`;

  const response = await groq.invoke(jsonPrompt);
  let content = String(response.content).trim();

  // Strip markdown code fences if the model adds them anyway
  content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  // Extract outermost { ... }
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`Groq manual JSON: no JSON object found in response. Got: ${content.slice(0, 200)}`);
  }

  return JSON.parse(content.slice(start, end + 1));
}

function getNvidiaLLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.NVIDIA_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 1024 } = options;
  return new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    model: process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct",
    temperature,
    maxTokens,
    timeout: 45000,
  });
}

function getGroqLLM(options: LLMOptions = {}): ChatGroq | null {
  if (!process.env.GROQ_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 1024 } = options;
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    // qwen3.8-27b: available on this Groq account, supports JSON generation well
    model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
    temperature,
    maxTokens,
  });
}

function getOpenAILLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 1024 } = options;
  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature,
    maxTokens,
    timeout: 45000,
  });
}

/** Returns primary LLM (Groq if available, else NVIDIA, else OpenAI). No auto-fallback. */
export function getLLM(options: LLMOptions = {}): ChatGroq | ChatOpenAI {
  const groq = getGroqLLM(options);
  if (groq) return groq;

  const nvidia = getNvidiaLLM(options);
  if (nvidia) return nvidia;

  const openai = getOpenAILLM(options);
  if (openai) {
    console.warn("[LLM] GROQ_API_KEY and NVIDIA_API_KEY not set — using OpenAI.");
    return openai;
  }

  throw new Error(
    "No LLM provider configured. Set GROQ_API_KEY, NVIDIA_API_KEY, or OPENAI_API_KEY."
  );
}

/**
 * withStructuredOutputFallback — tries NVIDIA NIM first, then Groq, then OpenAI.
 *
 * Groq is tried in two modes:
 *   a) withStructuredOutput (schema/tool mode) — fast, clean
 *   b) manual invoke + JSON extraction — fallback if model rejects schema mode
 */
export async function withStructuredOutputFallback(
  schema: Parameters<ChatOpenAI["withStructuredOutput"]>[0],
  prompt: string,
  options: LLMOptions = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const nvidia = getNvidiaLLM(options);
  const groq = getGroqLLM(options);
  const openai = getOpenAILLM(options);

  const groqModel = process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b";

  // ── 1. Try NVIDIA NIM (primary) ──────────────────────────────
  if (nvidia) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[LLM] Calling NVIDIA NIM (${process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct"}) attempt ${attempt}...`);
        const result = await withTimeout(
          nvidia.withStructuredOutput(schema).invoke(prompt),
          45000,
          "NVIDIA NIM"
        );
        console.log("[LLM] NVIDIA NIM responded OK.");
        return result;
      } catch (err) {
        const msg = (err as Error)?.message ?? "";
        if (attempt === 1) {
          console.warn(`[LLM] NVIDIA attempt 1 failed (${msg.slice(0, 80)}), retrying in 2s...`);
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        console.warn(`[LLM] NVIDIA failed after 2 attempts (${msg.slice(0, 80)}) — falling back to Groq.`);
        break;
      }
    }
  }

  // ── 2. Try Groq — mode A: withStructuredOutput ───────────────
  if (groq) {
    try {
      console.log(`[LLM] Calling Groq (${groqModel}) with structured output...`);
      const result = await withTimeout(
        groq.withStructuredOutput(schema).invoke(prompt),
        30000,
        "Groq structured"
      );
      console.log("[LLM] Groq structured output responded OK.");
      return result;
    } catch (err) {
      const msg = (err as Error)?.message ?? "";

      if (isGroqJsonSchemaFailure(err)) {
        // ── 3. Try Groq — mode B: manual JSON extraction ─────────
        console.warn(`[LLM] Groq schema mode failed ("Failed to generate JSON") — retrying with manual JSON extraction...`);
        try {
          const result = await withTimeout(
            invokeGroqManualJSON(groq, prompt),
            30000,
            "Groq manual JSON"
          );
          console.log("[LLM] Groq manual JSON responded OK.");
          return result;
        } catch (manualErr) {
          const manualMsg = (manualErr as Error)?.message ?? "";
          console.warn(`[LLM] Groq manual JSON also failed (${manualMsg.slice(0, 100)}) — falling back to OpenAI.`);
        }
      } else {
        console.warn(`[LLM] Groq failed (${msg.slice(0, 100)}) — falling back to OpenAI.`);
      }
    }
  }

  // ── 4. Fallback: OpenAI (tertiary) ───────────────────────────
  if (openai) {
    try {
      console.log("[LLM] Calling OpenAI (fallback)...");
      const result = await withTimeout(
        openai.withStructuredOutput(schema).invoke(prompt),
        45000,
        "OpenAI"
      );
      console.log("[LLM] OpenAI responded OK.");
      return result;
    } catch (err) {
      if (isQuotaExhausted(err)) {
        throw new Error(
          "All LLM providers are unavailable: NVIDIA NIM failed, Groq failed, and OpenAI has no billing quota. " +
          "Please check your GROQ_API_KEY at console.groq.com (free) or add OpenAI credits."
        );
      }
      throw err;
    }
  }

  if (!nvidia && !groq && !openai) {
    throw new Error(
      "No LLM provider available. Set GROQ_API_KEY (free at console.groq.com), " +
      "NVIDIA_API_KEY, or OPENAI_API_KEY."
    );
  }

  throw new Error("All configured LLM providers failed. Check your API keys and quotas.");
}
