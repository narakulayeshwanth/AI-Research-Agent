import { getLLM } from "../lib/llm";
import { AnalystMemoSchema, type ResearchState } from "../types/investment";

export async function analystMemoAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n, riskAnalysis: r, investmentDecision: d } = state;
  if (!p || !f || !d) throw new Error("Analyst memo requires complete analysis");

  const llm = getLLM({ temperature: 0.3 }); // slightly higher temp for professional writing quality
  const structuredLLM = llm.withStructuredOutput(AnalystMemoSchema);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  const prompt = `You are a Goldman Sachs-level equity research analyst. Write a professional analyst memo for ${p.name} (${p.ticker}).

RESEARCH DATA:
Company: ${p.name} | ${p.ticker} | ${p.sector}
Financial Score: ${f.overallScore}/10 | Recommendation: ${d.recommendation} (${d.confidence}% confidence)
Revenue: ${p.revenueFormatted} | Growth: ${p.revenueGrowthPct?.toFixed(1) ?? "N/A"}%
Net Margin: ${p.profitMarginPct?.toFixed(1) ?? "N/A"}% | P/E: ${p.peRatio?.toFixed(1) ?? "N/A"}x
Risk Level: ${r?.overallRiskLevel ?? "Medium"} | News Sentiment: ${n?.overallSentiment ?? "neutral"}
Investment Reasoning: ${d.reasoning}

WRITE THE FOLLOWING SECTIONS (each 2–4 sentences, professional tone):

1. executiveSummary: Opening overview — company, what it does, investment context
2. investmentThesis: Core thesis — why invest or avoid, anchored in fundamentals
3. financialHealth: Key financial metrics and what they signal (reference actual numbers)
4. riskAssessment: Top 2–3 risks and why they matter to investors
5. investmentRecommendation: Final recommendation with confidence and key rationale
6. conclusion: Closing statement — 1-2 sentences on the outlook
7. analystNote: Brief disclaimer/methodology note (1 sentence)

Style: Professional, concise, no fluff. Write as if this will be read by a hedge fund PM.
Date: ${dateStr}
Sources: ["Yahoo Finance", "Alpha Vantage", "NewsAPI.org", "NVIDIA NIM LLM", "Formula-based Scoring Engine"]`;

  const memo = await structuredLLM.invoke(prompt);

  return {
    analystMemo: {
      ...memo,
      dateGenerated: dateStr,
      sources: ["Yahoo Finance", "Alpha Vantage", "NewsAPI.org", "NVIDIA NIM LLM", "Formula-based Scoring Engine"],
    },
    completedAgents: [...state.completedAgents, "analystmemo"],
  };
}
