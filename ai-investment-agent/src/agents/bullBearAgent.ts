import { getLLM } from "@/lib/llm";
import { BullBearAnalysisSchema, type ResearchState } from "@/types/investment";

export async function bullBearAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n, riskAnalysis: r } = state;
  if (!p) throw new Error("BullBear agent requires company profile");

  const llm = getLLM({ temperature: 0.2 });
  const structuredLLM = llm.withStructuredOutput(BullBearAnalysisSchema);

  const prompt = `You are a seasoned equity research analyst writing a bull vs bear investment debate for ${p.name} (${p.ticker}).

FULL COMPANY CONTEXT:
Company: ${p.name} | Sector: ${p.sector} | Industry: ${p.industry}
Market Cap: ${p.marketCapFormatted} | Revenue: ${p.revenueFormatted}
Revenue Growth: ${p.revenueGrowthPct?.toFixed(1) ?? "N/A"}% | Net Margin: ${p.profitMarginPct?.toFixed(1) ?? "N/A"}%
P/E: ${p.peRatio?.toFixed(1) ?? "N/A"}x | D/E: ${p.debtToEquity?.toFixed(2) ?? "N/A"}

FINANCIAL SCORES (formula-calculated):
Growth: ${f?.growthScore ?? "N/A"}/10 | Profitability: ${f?.profitabilityScore ?? "N/A"}/10
Valuation: ${f?.valuationScore ?? "N/A"}/10 | Strength: ${f?.financialStrengthScore ?? "N/A"}/10
Overall: ${f?.overallScore ?? "N/A"}/10

NEWS SENTIMENT: ${n?.overallSentiment ?? "neutral"}
Positive developments: ${n?.positiveItems?.join("; ") ?? "None"}
Negative developments: ${n?.negativeItems?.join("; ") ?? "None"}

RISK ASSESSMENT: Overall ${r?.overallRiskLevel ?? "Medium"}
Key risks: ${[r?.competitionRisk?.category, r?.regulatoryRisk?.category, r?.marketRisk?.category].filter(Boolean).join(", ")}

TASK:
1. Write 3–5 BULL arguments (why to invest). Each needs:
   - title: short punchy title (max 8 words)
   - detail: 2 sentences with specific evidence

2. Write 3–5 BEAR arguments (why to avoid). Each needs:
   - title: short punchy title (max 8 words)
   - detail: 2 sentences with specific evidence

3. bullStrength score 0–10 (how compelling the bull case is)
4. bearStrength score 0–10 (how compelling the bear case is)
5. sources: ["Financial Analysis", "News Sentiment", "Risk Assessment", "NVIDIA NIM LLM"]

Be analytical, not generic. Reference actual metrics.`;

  const analysis = await structuredLLM.invoke(prompt);

  return {
    bullBearAnalysis: analysis,
    completedAgents: [...state.completedAgents, "bullbear"],
  };
}
