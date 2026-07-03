import { withStructuredOutputFallback } from "../lib/llm";
import { z } from "zod";
import { type ResearchState } from "../types/investment";

// Simpler intermediate schema — LLM returns a flat risks array, we map it to named keys
const RiskItemLLMSchema = z.object({
  category: z.enum([
    "Industry Risk",
    "Competition Risk",
    "Regulatory Risk",
    "Market Risk",
    "Valuation Risk",
  ]),
  level: z.enum(["Low", "Medium", "High"]),
  description: z.string(),
  mitigants: z.string(),
});

const RiskOutputSchema = z.object({
  risks: z.array(RiskItemLLMSchema).max(5),
  overallRiskLevel: z.enum(["Low", "Medium", "High"]),
  overallRiskSummary: z.string(),
});

export async function riskAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n } = state;
  if (!p) throw new Error("Risk agent requires company profile");

  const structuredLLM = { invoke: (p: string) => withStructuredOutputFallback(RiskOutputSchema, p, { temperature: 0.1 }) };

  const prompt = `You are a senior risk analyst. Evaluate investment risks for ${p.name} (${p.ticker}).

COMPANY CONTEXT:
- Sector: ${p.sector} | Industry: ${p.industry}
- Market Cap: ${p.marketCapFormatted} | Revenue: ${p.revenueFormatted}
- Revenue Growth: ${p.revenueGrowthPct?.toFixed(1) ?? "N/A"}% | Net Margin: ${p.profitMarginPct?.toFixed(1) ?? "N/A"}%
- P/E Ratio: ${p.peRatio?.toFixed(1) ?? "N/A"}x | D/E: ${p.debtToEquity?.toFixed(2) ?? "N/A"}
- Competitors: ${p.competitors.join(", ") || "N/A"}

FINANCIAL SCORES:
- Overall Financial Score: ${f?.overallScore ?? "N/A"}/10
- Growth: ${f?.growthScore ?? "N/A"} | Profitability: ${f?.profitabilityScore ?? "N/A"} | Valuation: ${f?.valuationScore ?? "N/A"} | Strength: ${f?.financialStrengthScore ?? "N/A"}

NEWS SENTIMENT:
- Overall: ${n?.overallSentiment ?? "N/A"}
- Key Negatives: ${n?.negativeItems?.join("; ") ?? "None"}

TASK: Return a "risks" array with exactly 5 items, one for each category below (in this exact order):
1. "Industry Risk"
2. "Competition Risk"
3. "Regulatory Risk"
4. "Market Risk"
5. "Valuation Risk"

For each risk provide:
- category: one of the exact strings above
- level: "Low", "Medium", or "High"
- description: 2 sentences on the risk
- mitigants: 1 sentence on what reduces this risk

Also provide:
- overallRiskLevel: "Low", "Medium", or "High"
- overallRiskSummary: 2-sentence summary`;

  const output = await structuredLLM.invoke(prompt);

  // Map flat array to named keys expected by the rest of the graph
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findRisk = (cat: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (output.risks as any[]).find((r: any) => r.category === cat) ?? {
      category: cat,
      level: "Medium" as const,
      description: "Insufficient data to assess.",
      mitigants: "Standard risk management practices apply.",
    };

  const riskAnalysis = {
    industryRisk: findRisk("Industry Risk"),
    competitionRisk: findRisk("Competition Risk"),
    regulatoryRisk: findRisk("Regulatory Risk"),
    marketRisk: findRisk("Market Risk"),
    valuationRisk: findRisk("Valuation Risk"),
    overallRiskLevel: output.overallRiskLevel,
    overallRiskSummary: output.overallRiskSummary,
    sources: ["Company Analysis", "News Sentiment", "Financial Metrics", "NVIDIA NIM LLM"],
  };

  return {
    riskAnalysis,
    completedAgents: [...state.completedAgents, "risk"],
  };
}
