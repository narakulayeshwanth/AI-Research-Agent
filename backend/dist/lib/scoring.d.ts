/**
 * Deterministic Financial Scoring Engine
 * LLM is never used to calculate scores — only to explain them.
 *
 * Weights:
 *   Growth Score         30%
 *   Profitability Score  25%
 *   Valuation Score      20%
 *   Financial Strength   25%
 */
/** Revenue growth % → score 0–10 */
export declare function calcGrowthScore(revenueGrowthPct: number | null): number;
/** Net profit margin % → score 0–10 */
export declare function calcProfitabilityScore(netMarginPct: number | null): number;
/**
 * P/E ratio vs sector average → score 0–10
 * Lower P/E relative to sector = better valuation
 */
export declare function calcValuationScore(peRatio: number | null, sectorPeAvg?: number): number;
/**
 * Financial strength from D/E ratio + current ratio → score 0–10
 * Low debt + high liquidity = strong balance sheet
 */
export declare function calcFinancialStrengthScore(debtToEquity: number | null, currentRatio: number | null): number;
/** Weighted composite score */
export declare function calcOverallFinancialScore(growthScore: number, profitabilityScore: number, valuationScore: number, financialStrengthScore: number): number;
/** Format large numbers for display */
export declare function formatCurrency(value: number | null): string;
/** Score to color class */
export declare function scoreToColor(score: number): "green" | "yellow" | "red";
//# sourceMappingURL=scoring.d.ts.map