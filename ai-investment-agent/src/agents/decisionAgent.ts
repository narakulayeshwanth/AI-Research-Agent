import { getLLM } from "@/lib/llm";
import { InvestmentDecisionSchema, type ResearchState } from "@/types/investment";

export async function decisionAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { companyProfile: p, financialAnalysis: f, newsAnalysis: n, riskAnalysis: r, bullBearAnalysis: bb } = state;
  if (!p || !f) throw new Error("Decision agent requires complete prior analysis");

  const llm = getLLM({ temperature: 0.05 }); // very low temp for consistent decisions
  const structuredLLM = llm.withStructuredOutput(InvestmentDecisionSchema);

  const prompt = `You are the head of equity research making a final investment decision for ${p.name} (${p.ticker}).

SYNTHESIZE ALL AGENT OUTPUTS:

FINANCIAL ANALYSIS:
- Overall Score: ${f.overallScore}/10 (weighted: Growth×30% + Profit×25% + Valuation×20% + Strength×25%)
- Growth: ${f.growthScore}/10 | Profitability: ${f.profitabilityScore}/10 | Valuation: ${f.valuationScore}/10 | Strength: ${f.financialStrengthScore}/10
- ${f.overallSummary}

NEWS SENTIMENT: ${n?.overallSentiment ?? "neutral"} (Positive: ${n?.positiveSentimentScore ?? 5}/10, Negative: ${n?.negativeSentimentScore ?? 5}/10)
- ${n?.sentimentSummary ?? "Limited news data available."}

RISK LEVEL: Overall ${r?.overallRiskLevel ?? "Medium"}
- ${r?.overallRiskSummary ?? "Standard market risks apply."}

BULL STRENGTH: ${bb?.bullStrength ?? 5}/10
BEAR STRENGTH: ${bb?.bearStrength ?? 5}/10

Key Bull Arguments:
${bb?.bullArguments?.map(a => `• ${a.title}: ${a.detail}`).join("\n") ?? "N/A"}

Key Bear Arguments:
${bb?.bearArguments?.map(a => `• ${a.title}: ${a.detail}`).join("\n") ?? "N/A"}

DECISION CRITERIA:
- INVEST: Strong financials (score ≥7), positive/neutral sentiment, manageable risk, bull case dominates
- HOLD: Mixed signals, moderate financials (score 4–7), balanced bull/bear, medium risk
- PASS: Weak financials (score <4), negative sentiment, high risk, bear case dominates

OUTPUT REQUIRED:
1. recommendation: INVEST, HOLD, or PASS
2. confidence: 0–100 (your conviction level)
3. reasoning: 3–4 sentence explanation referencing specific metrics
4. keyFactors: 3–5 bullet-point factors that drove the decision
5. timeHorizon: suggested investment horizon (e.g., "12–18 months", "Long-term (3–5 years)")
6. targetPrice: analyst target price estimate if applicable, else omit
7. sources: ["Financial Analysis", "News Sentiment", "Risk Assessment", "Bull-Bear Analysis", "NVIDIA NIM LLM"]

IMPORTANT: Also include a "whyNot" field — 2–4 reasons why someone might NOT follow this recommendation (counterarguments to your own decision). Add it to keyFactors prefixed with "⚠️ Risk:".`;

  // Get raw decision and add whyNot to keyFactors
  const decision = await structuredLLM.invoke(prompt);

  return {
    investmentDecision: decision,
    completedAgents: [...state.completedAgents, "decision"],
  };
}
