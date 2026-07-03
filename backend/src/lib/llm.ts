/**
 * LLM provider — OpenAI (gpt-4o-mini) is PRIMARY, NVIDIA NIM is FALLBACK.
 * OpenAI is faster and more reliable for structured output on production.
 * NVIDIA is used as fallback when OpenAI is unavailable or fails.
 */
import { ChatOpenAI } from "@langchain/openai";

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

/** Wrap any promise with a hard timeout that rejects after `ms` milliseconds */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[LLM] ${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function getOpenAILLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 2048 } = options;
  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature,
    maxTokens,
    timeout: 45000, // 45s client-side timeout
  });
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
    timeout: 45000,
  });
}

/** Returns primary LLM (OpenAI if available, else NVIDIA). No auto-fallback. */
export function getLLM(options: LLMOptions = {}): ChatOpenAI {
  const openai = getOpenAILLM(options);
  if (openai) return openai;

  const nvidia = getNvidiaLLM(options);
  if (nvidia) {
    console.warn("[LLM] OPENAI_API_KEY not set — using NVIDIA NIM.");
    return nvidia;
  }

  throw new Error(
    "No LLM provider configured. Set OPENAI_API_KEY or NVIDIA_API_KEY in environment variables."
  );
}

/**
 * withStructuredOutputFallback — tries OpenAI first, falls back to NVIDIA.
 * Uses Promise.race as a hard safety timeout (50s) in addition to client timeout.
 *
 * Usage (drop-in for llm.withStructuredOutput(schema).invoke(prompt)):
 *   await withStructuredOutputFallback(schema, prompt, options)
 */
export async function withStructuredOutputFallback(
  schema: Parameters<ChatOpenAI["withStructuredOutput"]>[0],
  prompt: string,
  options: LLMOptions = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const openai = getOpenAILLM(options);
  const nvidia = getNvidiaLLM(options);

  // ── Try OpenAI first (primary) ───────────────────────────────
  if (openai) {
    try {
      console.log("[LLM] Calling OpenAI (primary)...");
      const result = await withTimeout(
        openai.withStructuredOutput(schema).invoke(prompt),
        50000, // 50s hard safety timeout (above client 45s)
        "OpenAI"
      );
      console.log("[LLM] OpenAI responded OK.");
      return result;
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (nvidia) {
        console.warn(`[LLM] OpenAI failed (${msg.slice(0, 80)}) — falling back to NVIDIA NIM.`);
        // fall through to NVIDIA below
      } else {
        throw err; // no fallback
      }
    }
  }

  // ── Fallback: NVIDIA NIM ─────────────────────────────────────
  if (nvidia) {
    try {
      console.log("[LLM] Calling NVIDIA NIM (fallback)...");
      const result = await withTimeout(
        nvidia.withStructuredOutput(schema).invoke(prompt),
        50000,
        "NVIDIA NIM"
      );
      console.log("[LLM] NVIDIA NIM responded OK.");
      return result;
    } catch (err) {
      throw err;
    }
  }

  throw new Error(
    "No LLM provider available. Set OPENAI_API_KEY or NVIDIA_API_KEY."
  );
}
