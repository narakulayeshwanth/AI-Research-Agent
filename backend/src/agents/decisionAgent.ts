import { withStructuredOutputFallback } from "../lib/llm";
import { InvestmentDecisionSchema, type ResearchState } from "../types/investment";

export async function decisionAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n, riskAnalysis: r, bullBearAnalysis: bb } = state;
  if (!p || !f) throw new Error("Decision agent requires complete prior analysis");

  const prompt = `Investment decision for ${p.name} (${p.ticker}).
Financial score: ${f.overallScore}/10. News: ${n?.overallSentiment ?? "neutral"}. Risk: ${r?.overallRiskLevel ?? "Medium"}. Bull strength: ${bb?.bullStrength ?? 5}/10. Bear strength: ${bb?.bearStrength ?? 5}/10.
${f.overallSummary}

Rules: INVEST if score≥7 and risk≤Medium. PASS if score<4 or risk=High. Otherwise HOLD.

Return:
- recommendation: INVEST, HOLD, or PASS
- confidence: 0-100
- reasoning: 2-3 sentences
- keyFactors: 3-4 short bullet points
- timeHorizon: e.g. "12-18 months"
- targetPrice: null
- sources: ["Financial Analysis","News Sentiment","Risk Assessment","Bull-Bear Analysis","NVIDIA NIM LLM"]`;

  const decision = await withStructuredOutputFallback(InvestmentDecisionSchema, prompt, { temperature: 0.05 });

  return {
    investmentDecision: decision,
    completedAgents: [...state.completedAgents, "decision"],
  };
}
