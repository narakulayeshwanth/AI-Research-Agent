/**
 * getLLM() — Returns NVIDIA NIM as primary LLM, OpenAI as fallback.
 * Both use the OpenAI-compatible interface via @langchain/openai.
 */
import { ChatOpenAI } from "@langchain/openai";
interface LLMOptions {
    temperature?: number;
    maxTokens?: number;
}
export declare function getLLM(options?: LLMOptions): ChatOpenAI;
export {};
//# sourceMappingURL=llm.d.ts.map