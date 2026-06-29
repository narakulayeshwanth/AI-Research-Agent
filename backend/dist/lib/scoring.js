"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcGrowthScore = calcGrowthScore;
exports.calcProfitabilityScore = calcProfitabilityScore;
exports.calcValuationScore = calcValuationScore;
exports.calcFinancialStrengthScore = calcFinancialStrengthScore;
exports.calcOverallFinancialScore = calcOverallFinancialScore;
exports.formatCurrency = formatCurrency;
exports.scoreToColor = scoreToColor;
/** Revenue growth % → score 0–10 */
function calcGrowthScore(revenueGrowthPct) {
    if (revenueGrowthPct === null)
        return 5; // neutral if data missing
    if (revenueGrowthPct > 40)
        return 10;
    if (revenueGrowthPct > 30)
        return 9;
    if (revenueGrowthPct > 20)
        return 8;
    if (revenueGrowthPct > 15)
        return 7;
    if (revenueGrowthPct > 10)
        return 6;
    if (revenueGrowthPct > 5)
        return 5;
    if (revenueGrowthPct > 0)
        return 4;
    if (revenueGrowthPct > -5)
        return 3;
    if (revenueGrowthPct > -10)
        return 2;
    return 1;
}
/** Net profit margin % → score 0–10 */
function calcProfitabilityScore(netMarginPct) {
    if (netMarginPct === null)
        return 5;
    if (netMarginPct > 30)
        return 10;
    if (netMarginPct > 20)
        return 9;
    if (netMarginPct > 15)
        return 8;
    if (netMarginPct > 10)
        return 7;
    if (netMarginPct > 5)
        return 6;
    if (netMarginPct > 0)
        return 4;
    if (netMarginPct > -5)
        return 3;
    return 1;
}
/**
 * P/E ratio vs sector average → score 0–10
 * Lower P/E relative to sector = better valuation
 */
function calcValuationScore(peRatio, sectorPeAvg = 25) {
    if (peRatio === null || peRatio <= 0)
        return 5;
    const ratio = peRatio / sectorPeAvg;
    if (ratio < 0.5)
        return 10; // deeply undervalued
    if (ratio < 0.7)
        return 9;
    if (ratio < 0.85)
        return 8;
    if (ratio < 1.0)
        return 7;
    if (ratio < 1.2)
        return 6;
    if (ratio < 1.5)
        return 5;
    if (ratio < 2.0)
        return 4;
    if (ratio < 3.0)
        return 3;
    return 1; // severely overvalued
}
/**
 * Financial strength from D/E ratio + current ratio → score 0–10
 * Low debt + high liquidity = strong balance sheet
 */
function calcFinancialStrengthScore(debtToEquity, currentRatio) {
    let score = 5; // start neutral
    if (debtToEquity !== null) {
        if (debtToEquity < 0.3)
            score += 2.5;
        else if (debtToEquity < 0.5)
            score += 1.5;
        else if (debtToEquity < 1.0)
            score += 0.5;
        else if (debtToEquity < 2.0)
            score -= 1;
        else
            score -= 2;
    }
    if (currentRatio !== null) {
        if (currentRatio > 3)
            score += 2.5;
        else if (currentRatio > 2)
            score += 1.5;
        else if (currentRatio > 1.5)
            score += 0.5;
        else if (currentRatio > 1)
            score -= 0.5;
        else
            score -= 2;
    }
    return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}
/** Weighted composite score */
function calcOverallFinancialScore(growthScore, profitabilityScore, valuationScore, financialStrengthScore) {
    const weighted = growthScore * 0.30 +
        profitabilityScore * 0.25 +
        valuationScore * 0.20 +
        financialStrengthScore * 0.25;
    return Math.round(weighted * 10) / 10;
}
/** Format large numbers for display */
function formatCurrency(value) {
    if (value === null)
        return "N/A";
    if (Math.abs(value) >= 1e12)
        return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9)
        return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6)
        return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
}
/** Score to color class */
function scoreToColor(score) {
    if (score >= 7)
        return "green";
    if (score >= 4)
        return "yellow";
    return "red";
}
//# sourceMappingURL=scoring.js.map