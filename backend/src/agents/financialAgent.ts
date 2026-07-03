import { withStructuredOutputFallback } from "../lib/llm";
import {
  calcGrowthScore,
  calcProfitabilityScore,
  calcValuationScore,
  calcFinancialStrengthScore,
  calcOverallFinancialScore,
  formatCurrency,
} from "../lib/scoring";
import { FinancialAnalysisSchema, type ResearchState } from "../types/investment";
import { z } from "zod";

// Minimal schema — 2 fields only
const ReasoningSchema = z.object({
  scoresSummary: z.string().describe("2 sentences explaining the financial scores"),
  overallSummary: z.string().describe("1 sentence overall financial assessment"),
});

export async function financialAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const profile = state.companyProfile!;

  // ── 1. Deterministic formula scoring (no LLM needed) ──────────
  const growthScore = calcGrowthScore(profile.revenueGrowthPct);
  const profitabilityScore = calcProfitabilityScore(profile.profitMarginPct);
  const valuationScore = calcValuationScore(profile.peRatio, 25);
  const financialStrengthScore = calcFinancialStrengthScore(profile.debtToEquity, profile.currentRatio);
  const overallScore = calcOverallFinancialScore(growthScore, profitabilityScore, valuationScore, financialStrengthScore);

  // ── 2. LLM writes a brief summary only ────────────────────────
  const prompt = `Financial scores for ${profile.name} (${profile.ticker}):
Growth ${growthScore}/10 (rev growth ${profile.revenueGrowthPct?.toFixed(1) ?? "N/A"}%), Profitability ${profitabilityScore}/10 (margin ${profile.profitMarginPct?.toFixed(1) ?? "N/A"}%), Valuation ${valuationScore}/10 (P/E ${profile.peRatio?.toFixed(1) ?? "N/A"}x), Strength ${financialStrengthScore}/10, Overall ${overallScore}/10.
Write scoresSummary (2 sentences explaining what these scores mean) and overallSummary (1 sentence conclusion).`;

  const reasoning = await withStructuredOutputFallback(ReasoningSchema, prompt, { temperature: 0.1 });

  // Build per-score reasoning from the single summary
  const perScore = reasoning.scoresSummary;

  const analysis = FinancialAnalysisSchema.parse({
    growthScore,
    growthReasoning: perScore,
    profitabilityScore,
    profitabilityReasoning: perScore,
    valuationScore,
    valuationReasoning: perScore,
    financialStrengthScore,
    financialStrengthReasoning: perScore,
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
    sources: ["Formula Engine", "NVIDIA NIM LLM"],
  });

  return {
    financialAnalysis: analysis,
    completedAgents: [...state.completedAgents, "financial"],
  };
}
