/**
 * LLM provider — NVIDIA NIM (primary) → Groq (secondary) → OpenAI (tertiary fallback).
 * Groq free tier: 30 req/min, fast inference (~1-3s), no billing needed.
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

/** Returns true if the error is a permanent quota/billing failure (don't retry or fallback) */
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
    // llama-3.3-70b-versatile: free tier, fast, great structured output support
    model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
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
    "No LLM provider configured. Set GROQ_API_KEY, NVIDIA_API_KEY, or OPENAI_API_KEY in environment variables."
  );
}

/**
 * withStructuredOutputFallback — tries NVIDIA NIM first, then Groq, then OpenAI.
 * Groq is fast (~1-3s), free, and supports structured output natively.
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

  // ── Try NVIDIA NIM first (primary, if key is set) ─────────────
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
        // attempt 2 failed — fall through to Groq
        console.warn(`[LLM] NVIDIA failed after 2 attempts (${msg.slice(0, 80)}) — falling back to Groq.`);
        break;
      }
    }
  }

  // ── Try Groq (secondary — free, fast) ─────────────────────────
  if (groq) {
    try {
      console.log(`[LLM] Calling Groq (${process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"})...`);
      const result = await withTimeout(
        groq.withStructuredOutput(schema).invoke(prompt),
        30000,
        "Groq"
      );
      console.log("[LLM] Groq responded OK.");
      return result;
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      console.warn(`[LLM] Groq failed (${msg.slice(0, 100)}) — falling back to OpenAI.`);
    }
  }

  // ── Fallback: OpenAI (tertiary) ───────────────────────────────
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

  // If no provider at all
  if (!nvidia && !groq && !openai) {
    throw new Error(
      "No LLM provider available. Set GROQ_API_KEY (free at console.groq.com), " +
      "NVIDIA_API_KEY, or OPENAI_API_KEY."
    );
  }

  throw new Error(
    "All configured LLM providers failed. Check your API keys and quotas."
  );
}
