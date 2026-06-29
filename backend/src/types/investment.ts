import { z } from "zod";

// ─────────────────────────────────────────────
// Company Profile
// ─────────────────────────────────────────────
export const CompanyProfileSchema = z.object({
  name: z.string(),
  ticker: z.string(),
  description: z.string(),
  sector: z.string(),
  industry: z.string(),
  marketCap: z.number().nullable(),
  marketCapFormatted: z.string(),
  revenue: z.number().nullable(),
  revenueFormatted: z.string(),
  revenueGrowthPct: z.number().nullable(),
  netIncome: z.number().nullable(),
  netIncomeFormatted: z.string(),
  profitMarginPct: z.number().nullable(),
  debtToEquity: z.number().nullable(),
  peRatio: z.number().nullable(),
  currentRatio: z.number().nullable(),
  employees: z.number().nullable(),
  headquarters: z.string(),
  website: z.string(),
  competitors: z.array(z.string()),
  exchange: z.string(),
  currency: z.string(),
  sources: z.array(z.string()),
});
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

// ─────────────────────────────────────────────
// Financial Analysis
// ─────────────────────────────────────────────
export const FinancialScoreDetailSchema = z.object({
  score: z.number().min(0).max(10),
  reasoning: z.string(),
});

export const FinancialAnalysisSchema = z.object({
  growthScore: z.number().min(0).max(10),
  growthReasoning: z.string(),
  profitabilityScore: z.number().min(0).max(10),
  profitabilityReasoning: z.string(),
  valuationScore: z.number().min(0).max(10),
  valuationReasoning: z.string(),
  financialStrengthScore: z.number().min(0).max(10),
  financialStrengthReasoning: z.string(),
  overallScore: z.number().min(0).max(10),
  overallSummary: z.string(),
  keyMetrics: z.array(z.object({ label: z.string(), value: z.string() })),
  sources: z.array(z.string()),
});
export type FinancialAnalysis = z.infer<typeof FinancialAnalysisSchema>;

// ─────────────────────────────────────────────
// News Analysis
// ─────────────────────────────────────────────
export const NewsItemSchema = z.object({
  title: z.string(),
  summary: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  sentiment: z.enum(["positive", "negative", "neutral"]),
});

export const NewsAnalysisSchema = z.object({
  articles: z.array(NewsItemSchema),
  positiveItems: z.array(z.string()),
  negativeItems: z.array(z.string()),
  positiveSentimentScore: z.number().min(0).max(10),
  negativeSentimentScore: z.number().min(0).max(10),
  overallSentiment: z.enum(["bullish", "bearish", "neutral"]),
  sentimentSummary: z.string(),
  sources: z.array(z.string()),
});
export type NewsAnalysis = z.infer<typeof NewsAnalysisSchema>;

// ─────────────────────────────────────────────
// Risk Analysis
// ─────────────────────────────────────────────
export const RiskLevelSchema = z.enum(["Low", "Medium", "High"]);

export const RiskItemSchema = z.object({
  category: z.string(),
  level: RiskLevelSchema,
  description: z.string(),
  mitigants: z.string(),
});

export const RiskAnalysisSchema = z.object({
  industryRisk: RiskItemSchema,
  competitionRisk: RiskItemSchema,
  regulatoryRisk: RiskItemSchema,
  marketRisk: RiskItemSchema,
  valuationRisk: RiskItemSchema,
  overallRiskLevel: RiskLevelSchema,
  overallRiskSummary: z.string(),
  sources: z.array(z.string()),
});
export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>;

// ─────────────────────────────────────────────
// Bull-Bear Analysis
// ─────────────────────────────────────────────
export const BullBearAnalysisSchema = z.object({
  bullArguments: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .min(3)
    .max(5),
  bearArguments: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .min(3)
    .max(5),
  bullStrength: z.number().min(0).max(10),
  bearStrength: z.number().min(0).max(10),
  sources: z.array(z.string()),
});
export type BullBearAnalysis = z.infer<typeof BullBearAnalysisSchema>;

// ─────────────────────────────────────────────
// Investment Decision
// ─────────────────────────────────────────────
export const RecommendationSchema = z.enum(["INVEST", "HOLD", "PASS"]);

export const InvestmentDecisionSchema = z.object({
  recommendation: RecommendationSchema,
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  keyFactors: z.array(z.string()),
  timeHorizon: z.string(),
  targetPrice: z.string().optional(),
  sources: z.array(z.string()),
});
export type InvestmentDecision = z.infer<typeof InvestmentDecisionSchema>;

// ─────────────────────────────────────────────
// Analyst Memo
// ─────────────────────────────────────────────
export const AnalystMemoSchema = z.object({
  executiveSummary: z.string(),
  investmentThesis: z.string(),
  financialHealth: z.string(),
  riskAssessment: z.string(),
  investmentRecommendation: z.string(),
  conclusion: z.string(),
  analystNote: z.string(),
  dateGenerated: z.string(),
  sources: z.array(z.string()),
});
export type AnalystMemo = z.infer<typeof AnalystMemoSchema>;

// ─────────────────────────────────────────────
// Graph State (accumulated across all agents)
// ─────────────────────────────────────────────
export interface ResearchState {
  company: string;
  companyProfile?: CompanyProfile;
  financialAnalysis?: FinancialAnalysis;
  newsAnalysis?: NewsAnalysis;
  riskAnalysis?: RiskAnalysis;
  bullBearAnalysis?: BullBearAnalysis;
  investmentDecision?: InvestmentDecision;
  analystMemo?: AnalystMemo;
  error?: string;
  completedAgents: string[];
}

// ─────────────────────────────────────────────
// API Response
// ─────────────────────────────────────────────
export interface AnalyzeResponse {
  success: boolean;
  data?: ResearchState;
  error?: string;
}
