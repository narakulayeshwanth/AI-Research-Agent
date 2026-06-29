"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalystMemoSchema = exports.InvestmentDecisionSchema = exports.RecommendationSchema = exports.BullBearAnalysisSchema = exports.RiskAnalysisSchema = exports.RiskItemSchema = exports.RiskLevelSchema = exports.NewsAnalysisSchema = exports.NewsItemSchema = exports.FinancialAnalysisSchema = exports.FinancialScoreDetailSchema = exports.CompanyProfileSchema = void 0;
const zod_1 = require("zod");
// ─────────────────────────────────────────────
// Company Profile
// ─────────────────────────────────────────────
exports.CompanyProfileSchema = zod_1.z.object({
    name: zod_1.z.string(),
    ticker: zod_1.z.string(),
    description: zod_1.z.string(),
    sector: zod_1.z.string(),
    industry: zod_1.z.string(),
    marketCap: zod_1.z.number().nullable(),
    marketCapFormatted: zod_1.z.string(),
    revenue: zod_1.z.number().nullable(),
    revenueFormatted: zod_1.z.string(),
    revenueGrowthPct: zod_1.z.number().nullable(),
    netIncome: zod_1.z.number().nullable(),
    netIncomeFormatted: zod_1.z.string(),
    profitMarginPct: zod_1.z.number().nullable(),
    debtToEquity: zod_1.z.number().nullable(),
    peRatio: zod_1.z.number().nullable(),
    currentRatio: zod_1.z.number().nullable(),
    employees: zod_1.z.number().nullable(),
    headquarters: zod_1.z.string(),
    website: zod_1.z.string(),
    competitors: zod_1.z.array(zod_1.z.string()),
    exchange: zod_1.z.string(),
    currency: zod_1.z.string(),
    sources: zod_1.z.array(zod_1.z.string()),
});
// ─────────────────────────────────────────────
// Financial Analysis
// ─────────────────────────────────────────────
exports.FinancialScoreDetailSchema = zod_1.z.object({
    score: zod_1.z.number().min(0).max(10),
    reasoning: zod_1.z.string(),
});
exports.FinancialAnalysisSchema = zod_1.z.object({
    growthScore: zod_1.z.number().min(0).max(10),
    growthReasoning: zod_1.z.string(),
    profitabilityScore: zod_1.z.number().min(0).max(10),
    profitabilityReasoning: zod_1.z.string(),
    valuationScore: zod_1.z.number().min(0).max(10),
    valuationReasoning: zod_1.z.string(),
    financialStrengthScore: zod_1.z.number().min(0).max(10),
    financialStrengthReasoning: zod_1.z.string(),
    overallScore: zod_1.z.number().min(0).max(10),
    overallSummary: zod_1.z.string(),
    keyMetrics: zod_1.z.array(zod_1.z.object({ label: zod_1.z.string(), value: zod_1.z.string() })),
    sources: zod_1.z.array(zod_1.z.string()),
});
// ─────────────────────────────────────────────
// News Analysis
// ─────────────────────────────────────────────
exports.NewsItemSchema = zod_1.z.object({
    title: zod_1.z.string(),
    summary: zod_1.z.string(),
    url: zod_1.z.string(),
    publishedAt: zod_1.z.string(),
    sentiment: zod_1.z.enum(["positive", "negative", "neutral"]),
});
exports.NewsAnalysisSchema = zod_1.z.object({
    articles: zod_1.z.array(exports.NewsItemSchema),
    positiveItems: zod_1.z.array(zod_1.z.string()),
    negativeItems: zod_1.z.array(zod_1.z.string()),
    positiveSentimentScore: zod_1.z.number().min(0).max(10),
    negativeSentimentScore: zod_1.z.number().min(0).max(10),
    overallSentiment: zod_1.z.enum(["bullish", "bearish", "neutral"]),
    sentimentSummary: zod_1.z.string(),
    sources: zod_1.z.array(zod_1.z.string()),
});
// ─────────────────────────────────────────────
// Risk Analysis
// ─────────────────────────────────────────────
exports.RiskLevelSchema = zod_1.z.enum(["Low", "Medium", "High"]);
exports.RiskItemSchema = zod_1.z.object({
    category: zod_1.z.string(),
    level: exports.RiskLevelSchema,
    description: zod_1.z.string(),
    mitigants: zod_1.z.string(),
});
exports.RiskAnalysisSchema = zod_1.z.object({
    industryRisk: exports.RiskItemSchema,
    competitionRisk: exports.RiskItemSchema,
    regulatoryRisk: exports.RiskItemSchema,
    marketRisk: exports.RiskItemSchema,
    valuationRisk: exports.RiskItemSchema,
    overallRiskLevel: exports.RiskLevelSchema,
    overallRiskSummary: zod_1.z.string(),
    sources: zod_1.z.array(zod_1.z.string()),
});
// ─────────────────────────────────────────────
// Bull-Bear Analysis
// ─────────────────────────────────────────────
exports.BullBearAnalysisSchema = zod_1.z.object({
    bullArguments: zod_1.z
        .array(zod_1.z.object({ title: zod_1.z.string(), detail: zod_1.z.string() }))
        .min(3)
        .max(5),
    bearArguments: zod_1.z
        .array(zod_1.z.object({ title: zod_1.z.string(), detail: zod_1.z.string() }))
        .min(3)
        .max(5),
    bullStrength: zod_1.z.number().min(0).max(10),
    bearStrength: zod_1.z.number().min(0).max(10),
    sources: zod_1.z.array(zod_1.z.string()),
});
// ─────────────────────────────────────────────
// Investment Decision
// ─────────────────────────────────────────────
exports.RecommendationSchema = zod_1.z.enum(["INVEST", "HOLD", "PASS"]);
exports.InvestmentDecisionSchema = zod_1.z.object({
    recommendation: exports.RecommendationSchema,
    confidence: zod_1.z.number().min(0).max(100),
    reasoning: zod_1.z.string(),
    keyFactors: zod_1.z.array(zod_1.z.string()),
    timeHorizon: zod_1.z.string(),
    targetPrice: zod_1.z.string().optional(),
    sources: zod_1.z.array(zod_1.z.string()),
});
// ─────────────────────────────────────────────
// Analyst Memo
// ─────────────────────────────────────────────
exports.AnalystMemoSchema = zod_1.z.object({
    executiveSummary: zod_1.z.string(),
    investmentThesis: zod_1.z.string(),
    financialHealth: zod_1.z.string(),
    riskAssessment: zod_1.z.string(),
    investmentRecommendation: zod_1.z.string(),
    conclusion: zod_1.z.string(),
    analystNote: zod_1.z.string(),
    dateGenerated: zod_1.z.string(),
    sources: zod_1.z.array(zod_1.z.string()),
});
//# sourceMappingURL=investment.js.map