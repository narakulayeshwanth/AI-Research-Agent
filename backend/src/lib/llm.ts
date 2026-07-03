/**
 * LLM provider — NVIDIA NIM (primary), OpenAI (fallback).
 * Uses Promise.race as a hard safety timeout on top of client-side timeout.
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

function getNvidiaLLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.NVIDIA_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 2048 } = options;
  return new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    model: process.env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct",
    temperature,
    maxTokens,
    timeout: 45000, // 45s client-side timeout
  });
}

function getOpenAILLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 2048 } = options;
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
 * A Promise.race hard timeout (55s) guarantees the call always resolves/rejects.
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
      console.log("[LLM] Calling NVIDIA NIM (primary)...");
      const result = await withTimeout(
        nvidia.withStructuredOutput(schema).invoke(prompt),
        55000,
        "NVIDIA NIM"
      );
      console.log("[LLM] NVIDIA NIM responded OK.");
      return result;
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (openai) {
        console.warn(`[LLM] NVIDIA failed (${msg.slice(0, 100)}) — falling back to OpenAI.`);
        // fall through to OpenAI
      } else {
        throw err;
      }
    }
  }

  // ── Fallback: OpenAI ─────────────────────────────────────────
  if (openai) {
    console.log("[LLM] Calling OpenAI (fallback)...");
    const result = await withTimeout(
      openai.withStructuredOutput(schema).invoke(prompt),
      55000,
      "OpenAI"
    );
    console.log("[LLM] OpenAI responded OK.");
    return result;
  }

  throw new Error(
    "No LLM provider available. Set NVIDIA_API_KEY or OPENAI_API_KEY."
  );
}
