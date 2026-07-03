/**
 * getLLM() — Returns NVIDIA NIM as primary LLM, OpenAI as fallback.
 * getWithFallbackLLM() — Returns a RunnableWithFallbacks that automatically
 * switches to OpenAI when NVIDIA returns a 429 rate-limit error.
 */
import { ChatOpenAI } from "@langchain/openai";

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

function getNvidiaLLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.NVIDIA_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 4096 } = options;
  return new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    model: process.env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct",
    temperature,
    maxTokens,
  });
}

function getOpenAILLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 4096 } = options;
  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature,
    maxTokens,
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
 * isRateLimitError — checks if an error is a 429 / rate limit response.
 */
function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  // LangChain wraps HTTP errors — check status, code, and message
  if (e["status"] === 429 || e["statusCode"] === 429) return true;
  const msg = String(e["message"] ?? "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("rate_limit") ||
    msg.includes("too many requests") ||
    msg.includes("model_rate_limit")
  );
}

/**
 * withStructuredOutputFallback — wraps an LLM invoke with automatic OpenAI
 * fallback when NVIDIA returns a 429 rate-limit error.
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
  const nvidia = getNvidiaLLM(options);
  const openai = getOpenAILLM(options);

  // Try NVIDIA first
  if (nvidia) {
    try {
      const result = await nvidia.withStructuredOutput(schema).invoke(prompt);
      return result;
    } catch (err) {
      if (isRateLimitError(err) && openai) {
        console.warn(
          "[LLM] NVIDIA rate limited (429) — falling back to OpenAI for this call."
        );
        // fall through to OpenAI below
      } else {
        throw err; // non-rate-limit error, propagate
      }
    }
  }

  // Use OpenAI (either as fallback or primary)
  if (openai) {
    return openai.withStructuredOutput(schema).invoke(prompt);
  }

  throw new Error(
    "No LLM provider available. Set NVIDIA_API_KEY or OPENAI_API_KEY."
  );
}
