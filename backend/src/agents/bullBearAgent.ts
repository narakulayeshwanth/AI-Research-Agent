import { withStructuredOutputFallback } from "../lib/llm";
import { BullBearAnalysisSchema, type ResearchState } from "../types/investment";

export async function bullBearAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n, riskAnalysis: r } = state;
  if (!p) throw new Error("BullBear agent requires company profile");

  const prompt = `Bull vs bear analysis for ${p.name} (${p.ticker}).
Data: financial score ${f?.overallScore ?? "N/A"}/10, news ${n?.overallSentiment ?? "neutral"}, risk ${r?.overallRiskLevel ?? "Medium"}, rev growth ${p.revenueGrowthPct?.toFixed(1) ?? "N/A"}%, margin ${p.profitMarginPct?.toFixed(1) ?? "N/A"}%, P/E ${p.peRatio?.toFixed(1) ?? "N/A"}x.

Return:
- bullArguments: exactly 3 items, each with title (5 words max) and detail (1 sentence)
- bearArguments: exactly 3 items, each with title (5 words max) and detail (1 sentence)
- bullStrength: 0-10
- bearStrength: 0-10
- sources: ["Financial Analysis","News Sentiment","Risk Assessment","NVIDIA NIM LLM"]`;

  const analysis = await withStructuredOutputFallback(BullBearAnalysisSchema, prompt, { temperature: 0.2 });

  return {
    bullBearAnalysis: analysis,
    completedAgents: [...state.completedAgents, "bullbear"],
  };
}
