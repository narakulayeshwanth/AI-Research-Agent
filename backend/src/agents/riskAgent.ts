import { getLLM } from "../lib/llm";
import { RiskAnalysisSchema, type ResearchState } from "../types/investment";

export async function riskAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n } = state;
  if (!p) throw new Error("Risk agent requires company profile");

  const llm = getLLM({ temperature: 0.1 });
  const structuredLLM = llm.withStructuredOutput(RiskAnalysisSchema);

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

TASK: Assess 5 risk dimensions. For each, provide:
- category (exact names: "Industry Risk", "Competition Risk", "Regulatory Risk", "Market Risk", "Valuation Risk")
- level: Low / Medium / High
- description: 2 sentences on the risk
- mitigants: 1 sentence on what reduces this risk

Then give:
- overallRiskLevel: Low / Medium / High (weighted assessment)
- overallRiskSummary: 2-sentence summary

Sources for this analysis: ["Company Analysis", "News Sentiment", "Financial Metrics", "NVIDIA NIM LLM"]`;

  const analysis = await structuredLLM.invoke(prompt);

  return {
    riskAnalysis: analysis,
    completedAgents: [...state.completedAgents, "risk"],
  };
}
