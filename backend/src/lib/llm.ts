/**
 * LLM provider — NVIDIA NIM (primary), OpenAI (fallback).
 * Uses a faster 8B model to avoid timeouts on free-tier NVIDIA NIM.
 */
import { ChatOpenAI } from "@langchain/openai";

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
    // Use 8B model — much faster than 70B, completes in ~5-10s vs 60s+
    model: process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct",
    temperature,
    maxTokens,
    timeout: 45000,
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

/** Returns primary LLM (NVIDIA if available, else OpenAI). No auto-fallback. */
export function getLLM(options: LLMOptions = {}): ChatOpenAI {
  const nvidia = getNvidiaLLM(options);
  if (nvidia) return nvidia;

  const openai = getOpenAILLM(options);
  if (openai) {
    console.warn("[LLM] NVIDIA_API_KEY not set — using OpenAI.");
    return openai;
  }

  throw new Error(
    "No LLM provider configured. Set NVIDIA_API_KEY or OPENAI_API_KEY in environment variables."
  );
}

/**
 * withStructuredOutputFallback — tries NVIDIA NIM first, falls back to OpenAI.
 * Skips fallback if OpenAI has no billing quota (saves 45s wait time).
 */
export async function withStructuredOutputFallback(
  schema: Parameters<ChatOpenAI["withStructuredOutput"]>[0],
  prompt: string,
  options: LLMOptions = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const nvidia = getNvidiaLLM(options);
  const openai = getOpenAILLM(options);

  // ── Try NVIDIA NIM first (primary) ──────────────────────────
  if (nvidia) {
    try {
      console.log("[LLM] Calling NVIDIA NIM (meta/llama-3.1-8b-instruct)...");
      const result = await withTimeout(
        nvidia.withStructuredOutput(schema).invoke(prompt),
        45000,
        "NVIDIA NIM"
      );
      console.log("[LLM] NVIDIA NIM responded OK.");
      return result;
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (!openai) throw err;
      if (isQuotaExhausted(err)) {
        // NVIDIA quota exhausted — try OpenAI
        console.warn(`[LLM] NVIDIA quota exhausted — trying OpenAI fallback.`);
      } else {
        console.warn(`[LLM] NVIDIA failed (${msg.slice(0, 100)}) — falling back to OpenAI.`);
      }
      // fall through to OpenAI
    }
  }

  // ── Fallback: OpenAI ─────────────────────────────────────────
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
          "Both LLM providers are unavailable: NVIDIA NIM failed and OpenAI has no billing quota. " +
          "Please add OpenAI credits at platform.openai.com or check your NVIDIA API key."
        );
      }
      throw err;
    }
  }

  throw new Error(
    "No LLM provider available. Set NVIDIA_API_KEY or OPENAI_API_KEY."
  );
}
