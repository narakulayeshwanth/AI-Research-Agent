import { z } from "zod";
export declare const CompanyProfileSchema: z.ZodObject<{
    name: z.ZodString;
    ticker: z.ZodString;
    description: z.ZodString;
    sector: z.ZodString;
    industry: z.ZodString;
    marketCap: z.ZodNullable<z.ZodNumber>;
    marketCapFormatted: z.ZodString;
    revenue: z.ZodNullable<z.ZodNumber>;
    revenueFormatted: z.ZodString;
    revenueGrowthPct: z.ZodNullable<z.ZodNumber>;
    netIncome: z.ZodNullable<z.ZodNumber>;
    netIncomeFormatted: z.ZodString;
    profitMarginPct: z.ZodNullable<z.ZodNumber>;
    debtToEquity: z.ZodNullable<z.ZodNumber>;
    peRatio: z.ZodNullable<z.ZodNumber>;
    currentRatio: z.ZodNullable<z.ZodNumber>;
    employees: z.ZodNullable<z.ZodNumber>;
    headquarters: z.ZodString;
    website: z.ZodString;
    competitors: z.ZodArray<z.ZodString>;
    exchange: z.ZodString;
    currency: z.ZodString;
    sources: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export declare const FinancialScoreDetailSchema: z.ZodObject<{
    score: z.ZodNumber;
    reasoning: z.ZodString;
}, z.core.$strip>;
export declare const FinancialAnalysisSchema: z.ZodObject<{
    growthScore: z.ZodNumber;
    growthReasoning: z.ZodString;
    profitabilityScore: z.ZodNumber;
    profitabilityReasoning: z.ZodString;
    valuationScore: z.ZodNumber;
    valuationReasoning: z.ZodString;
    financialStrengthScore: z.ZodNumber;
    financialStrengthReasoning: z.ZodString;
    overallScore: z.ZodNumber;
    overallSummary: z.ZodString;
    keyMetrics: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>;
    sources: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type FinancialAnalysis = z.infer<typeof FinancialAnalysisSchema>;
export declare const NewsItemSchema: z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    url: z.ZodString;
    publishedAt: z.ZodString;
    sentiment: z.ZodEnum<{
        positive: "positive";
        negative: "negative";
        neutral: "neutral";
    }>;
}, z.core.$strip>;
export declare const NewsAnalysisSchema: z.ZodObject<{
    articles: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        summary: z.ZodString;
        url: z.ZodString;
        publishedAt: z.ZodString;
        sentiment: z.ZodEnum<{
            positive: "positive";
            negative: "negative";
            neutral: "neutral";
        }>;
    }, z.core.$strip>>;
    positiveItems: z.ZodArray<z.ZodString>;
    negativeItems: z.ZodArray<z.ZodString>;
    positiveSentimentScore: z.ZodNumber;
    negativeSentimentScore: z.ZodNumber;
    overallSentiment: z.ZodEnum<{
        neutral: "neutral";
        bullish: "bullish";
        bearish: "bearish";
    }>;
    sentimentSummary: z.ZodString;
    sources: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type NewsAnalysis = z.infer<typeof NewsAnalysisSchema>;
export declare const RiskLevelSchema: z.ZodEnum<{
    Low: "Low";
    Medium: "Medium";
    High: "High";
}>;
export declare const RiskItemSchema: z.ZodObject<{
    category: z.ZodString;
    level: z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
    }>;
    description: z.ZodString;
    mitigants: z.ZodString;
}, z.core.$strip>;
export declare const RiskAnalysisSchema: z.ZodObject<{
    industryRisk: z.ZodObject<{
        category: z.ZodString;
        level: z.ZodEnum<{
            Low: "Low";
            Medium: "Medium";
            High: "High";
        }>;
        description: z.ZodString;
        mitigants: z.ZodString;
    }, z.core.$strip>;
    competitionRisk: z.ZodObject<{
        category: z.ZodString;
        level: z.ZodEnum<{
            Low: "Low";
            Medium: "Medium";
            High: "High";
        }>;
        description: z.ZodString;
        mitigants: z.ZodString;
    }, z.core.$strip>;
    regulatoryRisk: z.ZodObject<{
        category: z.ZodString;
        level: z.ZodEnum<{
            Low: "Low";
            Medium: "Medium";
            High: "High";
        }>;
        description: z.ZodString;
        mitigants: z.ZodString;
    }, z.core.$strip>;
    marketRisk: z.ZodObject<{
        category: z.ZodString;
        level: z.ZodEnum<{
            Low: "Low";
            Medium: "Medium";
            High: "High";
        }>;
        description: z.ZodString;
        mitigants: z.ZodString;
    }, z.core.$strip>;
    valuationRisk: z.ZodObject<{
        category: z.ZodString;
        level: z.ZodEnum<{
            Low: "Low";
            Medium: "Medium";
            High: "High";
        }>;
        description: z.ZodString;
        mitigants: z.ZodString;
    }, z.core.$strip>;
    overallRiskLevel: z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
    }>;
    overallRiskSummary: z.ZodString;
    sources: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>;
export declare const BullBearAnalysisSchema: z.ZodObject<{
    bullArguments: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        detail: z.ZodString;
    }, z.core.$strip>>;
    bearArguments: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        detail: z.ZodString;
    }, z.core.$strip>>;
    bullStrength: z.ZodNumber;
    bearStrength: z.ZodNumber;
    sources: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type BullBearAnalysis = z.infer<typeof BullBearAnalysisSchema>;
export declare const RecommendationSchema: z.ZodEnum<{
    INVEST: "INVEST";
    HOLD: "HOLD";
    PASS: "PASS";
}>;
export declare const InvestmentDecisionSchema: z.ZodObject<{
    recommendation: z.ZodEnum<{
        INVEST: "INVEST";
        HOLD: "HOLD";
        PASS: "PASS";
    }>;
    confidence: z.ZodNumber;
    reasoning: z.ZodString;
    keyFactors: z.ZodArray<z.ZodString>;
    timeHorizon: z.ZodString;
    targetPrice: z.ZodOptional<z.ZodString>;
    sources: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type InvestmentDecision = z.infer<typeof InvestmentDecisionSchema>;
export declare const AnalystMemoSchema: z.ZodObject<{
    executiveSummary: z.ZodString;
    investmentThesis: z.ZodString;
    financialHealth: z.ZodString;
    riskAssessment: z.ZodString;
    investmentRecommendation: z.ZodString;
    conclusion: z.ZodString;
    analystNote: z.ZodString;
    dateGenerated: z.ZodString;
    sources: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type AnalystMemo = z.infer<typeof AnalystMemoSchema>;
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
export interface AnalyzeResponse {
    success: boolean;
    data?: ResearchState;
    error?: string;
}
//# sourceMappingURL=investment.d.ts.map