/**
 * getLLM() — Returns NVIDIA NIM as primary LLM, OpenAI as fallback.
 * Both use the OpenAI-compatible interface via @langchain/openai.
 */
import { ChatOpenAI } from "@langchain/openai";

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

export function getLLM(options: LLMOptions = {}): ChatOpenAI {
  const { temperature = 0.1, maxTokens = 4096 } = options;

  if (process.env.NVIDIA_API_KEY) {
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

  if (process.env.OPENAI_API_KEY) {
    console.warn("[LLM] NVIDIA_API_KEY not set — falling back to OpenAI.");
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature,
      maxTokens,
    });
  }

  throw new Error(
    "No LLM provider configured. Set NVIDIA_API_KEY or OPENAI_API_KEY in .env.local"
  );
}
