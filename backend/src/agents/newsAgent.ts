import { withStructuredOutputFallback } from "../lib/llm";
import { fetchNewsArticles } from "../services/newsApi";
import { NewsAnalysisSchema, type ResearchState } from "../types/investment";
import { z } from "zod";

// Minimal schema — no per-article classification (saves huge token generation)
const NewsLLMOutputSchema = z.object({
  positiveItems: z.array(z.string()).max(3).describe("Up to 3 positive news points"),
  negativeItems: z.array(z.string()).max(3).describe("Up to 3 negative news points"),
  positiveSentimentScore: z.number().min(0).max(10).describe("Positive sentiment 0-10"),
  negativeSentimentScore: z.number().min(0).max(10).describe("Negative sentiment 0-10"),
  overallSentiment: z.enum(["bullish", "bearish", "neutral"]),
  sentimentSummary: z.string().describe("1-2 sentences summarizing the news sentiment"),
});

export async function newsAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const profile = state.companyProfile!;

  // 1. Fetch raw articles (cached 15 min)
  const articles = await fetchNewsArticles(profile.name, profile.ticker);

  const articleText = articles.length > 0
    ? articles.slice(0, 5).map((a, i) =>
        `[${i + 1}] "${a.title}" (${a.source})`
      ).join("\n")
    : "No recent news found.";

  // 2. LLM sentiment analysis — minimal output
  const prompt = `News analyst for ${profile.name} (${profile.ticker}). Recent headlines:
${articleText}

Return:
- positiveItems: up to 3 positive bullet points (short phrases)
- negativeItems: up to 3 negative bullet points (short phrases)
- positiveSentimentScore: 0-10
- negativeSentimentScore: 0-10
- overallSentiment: bullish/bearish/neutral
- sentimentSummary: 1-2 sentences

If no news, use neutral scores of 5.`;

  const result = await withStructuredOutputFallback(NewsLLMOutputSchema, prompt, { temperature: 0.1 });

  // Build article list with generic neutral sentiment (no per-article LLM needed)
  const enrichedArticles = articles.slice(0, 5).map((raw) => ({
    title: raw.title,
    summary: raw.description?.slice(0, 150) ?? raw.title,
    url: raw.url,
    publishedAt: raw.publishedAt,
    sentiment: "neutral" as const,
  }));

  const analysis = NewsAnalysisSchema.parse({
    articles: enrichedArticles,
    positiveItems: result.positiveItems,
    negativeItems: result.negativeItems,
    positiveSentimentScore: result.positiveSentimentScore,
    negativeSentimentScore: result.negativeSentimentScore,
    overallSentiment: result.overallSentiment,
    sentimentSummary: result.sentimentSummary,
    sources: ["NewsAPI.org", "NVIDIA NIM LLM"],
  });

  return {
    newsAnalysis: analysis,
    completedAgents: [...state.completedAgents, "news"],
  };
}
