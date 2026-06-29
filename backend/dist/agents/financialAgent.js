"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialAgent = financialAgent;
const llm_1 = require("../lib/llm");
const scoring_1 = require("../lib/scoring");
const investment_1 = require("../types/investment");
const zod_1 = require("zod");
// LLM only provides reasoning text — scores come from formula engine
const ReasoningSchema = zod_1.z.object({
    growthReasoning: zod_1.z.string(),
    profitabilityReasoning: zod_1.z.string(),
    valuationReasoning: zod_1.z.string(),
    financialStrengthReasoning: zod_1.z.string(),
    overallSummary: zod_1.z.string(),
});
async function financialAgent(state) {
    const profile = state.companyProfile;
    // ── 1. Deterministic formula scoring ──────────────────────────
    const growthScore = (0, scoring_1.calcGrowthScore)(profile.revenueGrowthPct);
    const profitabilityScore = (0, scoring_1.calcProfitabilityScore)(profile.profitMarginPct);
    const valuationScore = (0, scoring_1.calcValuationScore)(profile.peRatio, 25);
    const financialStrengthScore = (0, scoring_1.calcFinancialStrengthScore)(profile.debtToEquity, profile.currentRatio);
    const overallScore = (0, scoring_1.calcOverallFinancialScore)(growthScore, profitabilityScore, valuationScore, financialStrengthScore);
    // ── 2. LLM explains the scores (NOT calculates them) ──────────
    const llm = (0, llm_1.getLLM)({ temperature: 0.15 });
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
    const analysis = investment_1.FinancialAnalysisSchema.parse({
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
//# sourceMappingURL=financialAgent.js.map