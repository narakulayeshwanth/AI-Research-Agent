import { withStructuredOutputFallback } from "../lib/llm";
import { z } from "zod";
import { type ResearchState } from "../types/investment";

// Flat minimal schema — 5 risk levels + 1 summary (no nested objects per risk)
const RiskOutputSchema = z.object({
  industryRiskLevel: z.enum(["Low", "Medium", "High"]),
  competitionRiskLevel: z.enum(["Low", "Medium", "High"]),
  regulatoryRiskLevel: z.enum(["Low", "Medium", "High"]),
  marketRiskLevel: z.enum(["Low", "Medium", "High"]),
  valuationRiskLevel: z.enum(["Low", "Medium", "High"]),
  overallRiskLevel: z.enum(["Low", "Medium", "High"]),
  riskSummary: z.string().describe("2 sentences summarizing the key risks"),
});

export async function riskAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n } = state;
  if (!p) throw new Error("Risk agent requires company profile");

  const prompt = `Rate investment risks for ${p.name} (${p.ticker}, ${p.sector} sector).
Key data: P/E ${p.peRatio?.toFixed(1) ?? "N/A"}x, D/E ${p.debtToEquity?.toFixed(2) ?? "N/A"}, rev growth ${p.revenueGrowthPct?.toFixed(1) ?? "N/A"}%, financial score ${f?.overallScore ?? "N/A"}/10, news ${n?.overallSentiment ?? "neutral"}.
Rate each risk as Low/Medium/High: industryRiskLevel, competitionRiskLevel, regulatoryRiskLevel, marketRiskLevel, valuationRiskLevel, overallRiskLevel.
Write riskSummary: 2 sentences on the biggest risks.`;

  const output = await withStructuredOutputFallback(RiskOutputSchema, prompt, { temperature: 0.1 });

  const makeRisk = (category: string, level: "Low" | "Medium" | "High") => ({
    category,
    level,
    description: `${level} risk for ${category.replace(" Risk", "").toLowerCase()} factors in the ${p.sector} sector.`,
    mitigants: "Standard risk management and diversification practices apply.",
  });

  const riskAnalysis = {
    industryRisk: makeRisk("Industry Risk", output.industryRiskLevel),
    competitionRisk: makeRisk("Competition Risk", output.competitionRiskLevel),
    regulatoryRisk: makeRisk("Regulatory Risk", output.regulatoryRiskLevel),
    marketRisk: makeRisk("Market Risk", output.marketRiskLevel),
    valuationRisk: makeRisk("Valuation Risk", output.valuationRiskLevel),
    overallRiskLevel: output.overallRiskLevel,
    overallRiskSummary: output.riskSummary,
    sources: ["Financial Metrics", "News Sentiment", "NVIDIA NIM LLM"],
  };

  return {
    riskAnalysis,
    completedAgents: [...state.completedAgents, "risk"],
  };
}
