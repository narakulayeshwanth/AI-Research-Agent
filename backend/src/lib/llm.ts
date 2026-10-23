/**
 * LLM provider — Groq (primary) → NVIDIA NIM (quick attempt) → OpenAI (last resort).
 *
 * Why Groq is primary: NVIDIA NIM consistently times out on Render's shared IPs,
 * wasting 90s per agent call (2 × 45s). With 7 agents in the pipeline that's 10+ min.
 * Groq responds in 1-5s and is free tier.
 *
 * Groq JSON strategy:
 *   1. withStructuredOutput (tool/json-schema mode)
 *   2. If model rejects schema ("Failed to generate JSON") → manual invoke + JSON extraction
 */
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

/** Hard timeout wrapper */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[LLM] ${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/** Permanent quota/billing failure — no point retrying */
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

/** Groq rejected strict JSON schema generation — retry with manual extraction */
function isGroqJsonSchemaFailure(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? "").toLowerCase();
  return msg.includes("failed to generate json") || msg.includes("failed_generation");
}

/**
 * Manual JSON extraction for Groq models that don't support strict schema mode.
 * Uses /no_think to disable Qwen3 chain-of-thought (avoids ~30s of thinking tokens).
 */
async function invokeGroqManualJSON(groq: ChatGroq, prompt: string): Promise<unknown> {
  const jsonPrompt =
    `/no_think\n` +
    `${prompt}\n\n` +
    `IMPORTANT: Respond with ONLY a raw JSON object — no markdown, no code fences, no explanation.\n` +
    `Start your response with { and end with }.`;

  const response = await groq.invoke(jsonPrompt);
  let content = String(response.content).trim();

  // Strip <think>...</think> blocks if model outputs them anyway
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip markdown code fences
  content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(
      `Groq manual JSON: no JSON object found. Got: ${content.slice(0, 200)}`
    );
  }

  return JSON.parse(content.slice(start, end + 1));
}

function getGroqLLM(options: LLMOptions = {}): ChatGroq | null {
  if (!process.env.GROQ_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 1024 } = options;
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
    temperature,
    maxTokens,
  });
}

function getNvidiaLLM(options: LLMOptions = {}): ChatOpenAI | null {
  if (!process.env.NVIDIA_API_KEY) return null;
  const { temperature = 0.1, maxTokens = 1024 } = options;
  return new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: { baseURL: "https://integrate.api.nvidia.com/v1" },
    model: process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct",
    temperature,
    maxTokens,
    timeout: 15000, // Fail fast — if NVIDIA doesn't respond in 15s it's not going to
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

/** Returns primary LLM for simple (non-structured) calls */
export function getLLM(options: LLMOptions = {}): ChatGroq | ChatOpenAI {
  const groq = getGroqLLM(options);
  if (groq) return groq;

  const nvidia = getNvidiaLLM(options);
  if (nvidia) return nvidia;

  const openai = getOpenAILLM(options);
  if (openai) return openai;

  throw new Error(
    "No LLM provider configured. Set GROQ_API_KEY, NVIDIA_API_KEY, or OPENAI_API_KEY."
  );
}

/**
 * withStructuredOutputFallback
 *
 * Chain: Groq (schema mode) → Groq (manual JSON) → NVIDIA (single fast attempt) → OpenAI
 *
 * Total worst-case per agent call: ~15s Groq + 15s NVIDIA + 45s OpenAI = ~75s max
 * vs previous: 90s NVIDIA alone (always failing) before Groq even tried.
 */
export async function withStructuredOutputFallback(
  schema: Parameters<ChatOpenAI["withStructuredOutput"]>[0],
  prompt: string,
  options: LLMOptions = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const groq = getGroqLLM(options);
  const nvidia = getNvidiaLLM(options);
  const openai = getOpenAILLM(options);

  const groqModel = process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b";
  const nvidiaModel = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct";

  // ── 1. Groq — schema mode (fast, ~1-5s) ─────────────────────
  if (groq) {
    try {
      console.log(`[LLM] Calling Groq (${groqModel}) structured output...`);
      const result = await withTimeout(
        groq.withStructuredOutput(schema).invoke(prompt),
        20000,
        "Groq structured"
      );
      console.log("[LLM] Groq structured OK.");
      return result;
    } catch (err) {
      const msg = (err as Error)?.message ?? "";

      if (isGroqJsonSchemaFailure(err)) {
        // ── 2. Groq — manual JSON extraction ──────────────────
        console.warn(`[LLM] Groq schema mode rejected — retrying with manual JSON extraction...`);
        try {
          const result = await withTimeout(
            invokeGroqManualJSON(groq, prompt),
            25000,
            "Groq manual JSON"
          );
          console.log("[LLM] Groq manual JSON OK.");
          return result;
        } catch (manualErr) {
          console.warn(
            `[LLM] Groq manual JSON failed (${(manualErr as Error)?.message?.slice(0, 80)}) — trying NVIDIA...`
          );
        }
      } else {
        console.warn(`[LLM] Groq failed (${msg.slice(0, 80)}) — trying NVIDIA...`);
      }
    }
  }

  // ── 3. NVIDIA NIM — single attempt, short timeout (15s) ──────
  if (nvidia) {
    try {
      console.log(`[LLM] Calling NVIDIA NIM (${nvidiaModel}) — single attempt, 15s timeout...`);
      const result = await withTimeout(
        nvidia.withStructuredOutput(schema).invoke(prompt),
        15000,
        "NVIDIA NIM"
      );
      console.log("[LLM] NVIDIA NIM OK.");
      return result;
    } catch (err) {
      console.warn(
        `[LLM] NVIDIA failed (${(err as Error)?.message?.slice(0, 80)}) — falling back to OpenAI.`
      );
    }
  }

  // ── 4. OpenAI — last resort ───────────────────────────────────
  if (openai) {
    try {
      console.log("[LLM] Calling OpenAI (last resort)...");
      const result = await withTimeout(
        openai.withStructuredOutput(schema).invoke(prompt),
        45000,
        "OpenAI"
      );
      console.log("[LLM] OpenAI OK.");
      return result;
    } catch (err) {
      if (isQuotaExhausted(err)) {
        throw new Error(
          "All LLM providers failed: Groq failed, NVIDIA NIM timed out, OpenAI has no billing quota. " +
          "Please check GROQ_API_KEY at console.groq.com."
        );
      }
      throw err;
    }
  }

  throw new Error(
    "No LLM provider available. Set GROQ_API_KEY (free), NVIDIA_API_KEY, or OPENAI_API_KEY."
  );
}
