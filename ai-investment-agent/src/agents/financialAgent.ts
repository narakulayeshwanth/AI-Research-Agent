import { getLLM } from "@/lib/llm";
import {
  calcGrowthScore,
  calcProfitabilityScore,
  calcValuationScore,
  calcFinancialStrengthScore,
  calcOverallFinancialScore,
  formatCurrency,
} from "@/lib/scoring";
import { FinancialAnalysisSchema, type ResearchState } from "@/types/investment";
import { z } from "zod";

// LLM only provides reasoning text — scores come from formula engine
const ReasoningSchema = z.object({
  growthReasoning: z.string(),
  profitabilityReasoning: z.string(),
  valuationReasoning: z.string(),
  financialStrengthReasoning: z.string(),
  overallSummary: z.string(),
});

export async function financialAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const profile = state.companyProfile!;

  // ── 1. Deterministic formula scoring ──────────────────────────
  const growthScore = calcGrowthScore(profile.revenueGrowthPct);
  const profitabilityScore = calcProfitabilityScore(profile.profitMarginPct);
  const valuationScore = calcValuationScore(profile.peRatio, 25);
  const financialStrengthScore = calcFinancialStrengthScore(
    profile.debtToEquity,
    profile.currentRatio
  );
  const overallScore = calcOverallFinancialScore(
    growthScore,
    profitabilityScore,
    valuationScore,
    financialStrengthScore
  );

  // ── 2. LLM explains the scores (NOT calculates them) ──────────
  const llm = getLLM({ temperature: 0.15 });
  const structuredLLM = llm.withStructuredOutput(ReasoningSchema);

  const prompt = `You are a senior equity analyst. Explain the following pre-calculated financial scores for ${profile.name} (${profile.ticker}).
Write 1–2 concise sentences per dimension. Be specific, reference the actual metrics.

SCORES (already computed, do not change):
- Growth Score: ${growthScore}/10 (Revenue Growth: ${profile.revenueGrowthPct?.toFixed(1) ?? "N/A"}%)
- Profitability Score: ${profitabilityScore}/10 (Net Margin: ${profile.profitMarginPct?.toFixed(1) ?? "N/A"}%)
- Valuation Score: ${valuationScore}/10 (P/E: ${profile.peRatio?.toFixed(1) ?? "N/A"}x)
- Financial Strength Score: ${financialStrengthScore}/10 (D/E: ${profile.debtToEquity?.toFixed(2) ?? "N/A"}, Current Ratio: ${profile.currentRatio?.toFixed(2) ?? "N/A"})
- Overall Score: ${overallScore}/10

KEY METRICS:
- Market Cap: ${profile.marketCapFormatted}
- Revenue: ${profile.revenueFormatted}
- Net Income: ${profile.netIncomeFormatted}
- Sector: ${profile.sector}

Write professional, factual reasoning for each score. Then a 2-sentence overall summary.`;

  const reasoning = await structuredLLM.invoke(prompt);

  const analysis = FinancialAnalysisSchema.parse({
    growthScore,
    growthReasoning: reasoning.growthReasoning,
    profitabilityScore,
    profitabilityReasoning: reasoning.profitabilityReasoning,
    valuationScore,
    valuationReasoning: reasoning.valuationReasoning,
    financialStrengthScore,
    financialStrengthReasoning: reasoning.financialStrengthReasoning,
    overallScore,
    overallSummary: reasoning.overallSummary,
    keyMetrics: [
      { label: "Market Cap", value: profile.marketCapFormatted },
      { label: "Revenue", value: profile.revenueFormatted },
      { label: "Net Income", value: profile.netIncomeFormatted },
      { label: "Revenue Growth", value: profile.revenueGrowthPct != null ? `${profile.revenueGrowthPct.toFixed(1)}%` : "N/A" },
      { label: "Net Margin", value: profile.profitMarginPct != null ? `${profile.profitMarginPct.toFixed(1)}%` : "N/A" },
      { label: "P/E Ratio", value: profile.peRatio != null ? `${profile.peRatio.toFixed(1)}x` : "N/A" },
      { label: "D/E Ratio", value: profile.debtToEquity != null ? profile.debtToEquity.toFixed(2) : "N/A" },
      { label: "Current Ratio", value: profile.currentRatio != null ? profile.currentRatio.toFixed(2) : "N/A" },
      { label: "Employees", value: profile.employees != null ? profile.employees.toLocaleString() : "N/A" },
    ],
    sources: ["Alpha Vantage", "Formula Engine", "NVIDIA NIM LLM"],
  });

  return {
    financialAnalysis: analysis,
    completedAgents: [...state.completedAgents, "financial"],
  };
}
