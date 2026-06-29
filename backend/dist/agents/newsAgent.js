"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsAgent = newsAgent;
const llm_1 = require("../lib/llm");
const newsApi_1 = require("../services/newsApi");
const investment_1 = require("../types/investment");
const zod_1 = require("zod");
const NewsLLMOutputSchema = zod_1.z.object({
    classifiedArticles: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        summary: zod_1.z.string(),
        sentiment: zod_1.z.enum(["positive", "negative", "neutral"]),
    })),
    positiveItems: zod_1.z.array(zod_1.z.string()).max(5),
    negativeItems: zod_1.z.array(zod_1.z.string()).max(5),
    positiveSentimentScore: zod_1.z.number().min(0).max(10),
    negativeSentimentScore: zod_1.z.number().min(0).max(10),
    overallSentiment: zod_1.z.enum(["bullish", "bearish", "neutral"]),
    sentimentSummary: zod_1.z.string(),
});
async function newsAgent(state) {
    const profile = state.companyProfile;
    // 1. Fetch raw articles (cached 15 min)
    const articles = await (0, newsApi_1.fetchNewsArticles)(profile.name, profile.ticker);
    const articleText = articles.length > 0
        ? articles.map((a, i) => `[${i + 1}] "${a.title}" — ${a.description?.slice(0, 150) ?? "No description"} (${a.source}, ${new Date(a.publishedAt).toLocaleDateString()})`).join("\n")
        : "No recent news articles found.";
    // 2. LLM classifies and scores sentiment (structured output)
    const llm = (0, llm_1.getLLM)({ temperature: 0.1 });
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
            sentiment: classified?.sentiment ?? "neutral",
        };
    });
    const analysis = investment_1.NewsAnalysisSchema.parse({
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
//# sourceMappingURL=newsAgent.js.map