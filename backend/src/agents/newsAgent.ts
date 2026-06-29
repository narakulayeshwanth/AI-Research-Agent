import { getLLM } from "../lib/llm";
import { fetchNewsArticles } from "../services/newsApi";
import { NewsAnalysisSchema, type ResearchState } from "../types/investment";
import { z } from "zod";

const NewsLLMOutputSchema = z.object({
  classifiedArticles: z.array(z.object({
    title: z.string(),
    summary: z.string(),
    sentiment: z.enum(["positive", "negative", "neutral"]),
  })),
  positiveItems: z.array(z.string()).max(5),
  negativeItems: z.array(z.string()).max(5),
  positiveSentimentScore: z.number().min(0).max(10),
  negativeSentimentScore: z.number().min(0).max(10),
  overallSentiment: z.enum(["bullish", "bearish", "neutral"]),
  sentimentSummary: z.string(),
});

export async function newsAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const profile = state.companyProfile!;

  // 1. Fetch raw articles (cached 15 min)
  const articles = await fetchNewsArticles(profile.name, profile.ticker);

  const articleText = articles.length > 0
    ? articles.map((a, i) =>
        `[${i + 1}] "${a.title}" — ${a.description?.slice(0, 150) ?? "No description"} (${a.source}, ${new Date(a.publishedAt).toLocaleDateString()})`
      ).join("\n")
    : "No recent news articles found.";

  // 2. LLM classifies and scores sentiment (structured output)
  const llm = getLLM({ temperature: 0.1 });
  const structuredLLM = llm.withStructuredOutput(NewsLLMOutputSchema);

  const prompt = `You are a financial news analyst. Analyze these recent news articles about ${profile.name} (${profile.ticker}).

ARTICLES:
${articleText}

TASKS:
1. Classify each article as positive, negative, or neutral for investors
2. Write a 1-sentence summary for each article
3. List up to 5 key positive developments (product launches, revenue growth, partnerships, etc.)
4. List up to 5 key negative developments (lawsuits, layoffs, regulatory issues, etc.)
5. Score positive sentiment 0–10 (10 = very bullish news)
6. Score negative sentiment 0–10 (10 = very bearish news, many negative articles)
7. Give overall sentiment: bullish/bearish/neutral
8. Write a 2-sentence sentiment summary

If no articles provided, give neutral scores of 5 and note limited data.`;

  const result = await structuredLLM.invoke(prompt);

  // Merge classified metadata back with raw articles (URL, publishedAt, source)
  const enrichedArticles = articles.map((raw, i) => {
    const classified = result.classifiedArticles[i];
    return {
      title: raw.title,
      summary: classified?.summary ?? raw.description?.slice(0, 150) ?? "",
      url: raw.url,
      publishedAt: raw.publishedAt,
      sentiment: classified?.sentiment ?? "neutral" as const,
    };
  });

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
