declare const ResearchStateAnnotation: import("@langchain/langgraph").AnnotationRoot<{
    company: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    companyProfile: import("@langchain/langgraph").BaseChannel<{
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined, {
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    financialAnalysis: import("@langchain/langgraph").BaseChannel<{
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined, {
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined> | undefined, unknown>;
    newsAnalysis: import("@langchain/langgraph").BaseChannel<{
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined, {
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    riskAnalysis: import("@langchain/langgraph").BaseChannel<{
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined, {
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    bullBearAnalysis: import("@langchain/langgraph").BaseChannel<{
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined, {
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined> | undefined, unknown>;
    investmentDecision: import("@langchain/langgraph").BaseChannel<{
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined, {
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | import("@langchain/langgraph").OverwriteValue<{
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined> | undefined, unknown>;
    analystMemo: import("@langchain/langgraph").BaseChannel<{
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined, {
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    error: import("@langchain/langgraph").BaseChannel<string | undefined, string | import("@langchain/langgraph").OverwriteValue<string | undefined> | undefined, unknown>;
    completedAgents: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}>;
export declare const investmentGraph: import("@langchain/langgraph").CompiledStateGraph<{
    company: string;
    companyProfile: {
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined;
    financialAnalysis: {
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined;
    newsAnalysis: {
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined;
    riskAnalysis: {
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined;
    bullBearAnalysis: {
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined;
    investmentDecision: {
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined;
    analystMemo: {
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined;
    error: string | undefined;
    completedAgents: string[];
}, {
    company?: string | import("@langchain/langgraph").OverwriteValue<string> | undefined;
    companyProfile?: {
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined> | undefined;
    financialAnalysis?: {
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined> | undefined;
    newsAnalysis?: {
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined> | undefined;
    riskAnalysis?: {
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined> | undefined;
    bullBearAnalysis?: {
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined> | undefined;
    investmentDecision?: {
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | import("@langchain/langgraph").OverwriteValue<{
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined> | undefined;
    analystMemo?: {
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined> | undefined;
    error?: string | import("@langchain/langgraph").OverwriteValue<string | undefined> | undefined;
    completedAgents?: string[] | import("@langchain/langgraph").OverwriteValue<string[]> | undefined;
}, "research" | "financial" | "news" | "risk" | "bullbear" | "decision" | "analystmemo" | "__start__", {
    company: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    companyProfile: import("@langchain/langgraph").BaseChannel<{
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined, {
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    financialAnalysis: import("@langchain/langgraph").BaseChannel<{
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined, {
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined> | undefined, unknown>;
    newsAnalysis: import("@langchain/langgraph").BaseChannel<{
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined, {
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    riskAnalysis: import("@langchain/langgraph").BaseChannel<{
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined, {
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    bullBearAnalysis: import("@langchain/langgraph").BaseChannel<{
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined, {
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined> | undefined, unknown>;
    investmentDecision: import("@langchain/langgraph").BaseChannel<{
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined, {
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | import("@langchain/langgraph").OverwriteValue<{
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined> | undefined, unknown>;
    analystMemo: import("@langchain/langgraph").BaseChannel<{
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined, {
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    error: import("@langchain/langgraph").BaseChannel<string | undefined, string | import("@langchain/langgraph").OverwriteValue<string | undefined> | undefined, unknown>;
    completedAgents: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}, {
    company: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    companyProfile: import("@langchain/langgraph").BaseChannel<{
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined, {
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        name: string;
        ticker: string;
        description: string;
        sector: string;
        industry: string;
        marketCap: number | null;
        marketCapFormatted: string;
        revenue: number | null;
        revenueFormatted: string;
        revenueGrowthPct: number | null;
        netIncome: number | null;
        netIncomeFormatted: string;
        profitMarginPct: number | null;
        debtToEquity: number | null;
        peRatio: number | null;
        currentRatio: number | null;
        employees: number | null;
        headquarters: string;
        website: string;
        competitors: string[];
        exchange: string;
        currency: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    financialAnalysis: import("@langchain/langgraph").BaseChannel<{
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined, {
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        growthScore: number;
        growthReasoning: string;
        profitabilityScore: number;
        profitabilityReasoning: string;
        valuationScore: number;
        valuationReasoning: string;
        financialStrengthScore: number;
        financialStrengthReasoning: string;
        overallScore: number;
        overallSummary: string;
        keyMetrics: {
            label: string;
            value: string;
        }[];
        sources: string[];
    } | undefined> | undefined, unknown>;
    newsAnalysis: import("@langchain/langgraph").BaseChannel<{
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined, {
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        articles: {
            title: string;
            summary: string;
            url: string;
            publishedAt: string;
            sentiment: "positive" | "negative" | "neutral";
        }[];
        positiveItems: string[];
        negativeItems: string[];
        positiveSentimentScore: number;
        negativeSentimentScore: number;
        overallSentiment: "neutral" | "bullish" | "bearish";
        sentimentSummary: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    riskAnalysis: import("@langchain/langgraph").BaseChannel<{
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined, {
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        industryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        competitionRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        regulatoryRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        marketRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        valuationRisk: {
            category: string;
            level: "Low" | "Medium" | "High";
            description: string;
            mitigants: string;
        };
        overallRiskLevel: "Low" | "Medium" | "High";
        overallRiskSummary: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    bullBearAnalysis: import("@langchain/langgraph").BaseChannel<{
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined, {
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        bullArguments: {
            title: string;
            detail: string;
        }[];
        bearArguments: {
            title: string;
            detail: string;
        }[];
        bullStrength: number;
        bearStrength: number;
        sources: string[];
    } | undefined> | undefined, unknown>;
    investmentDecision: import("@langchain/langgraph").BaseChannel<{
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined, {
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | import("@langchain/langgraph").OverwriteValue<{
        recommendation: "INVEST" | "HOLD" | "PASS";
        confidence: number;
        reasoning: string;
        keyFactors: string[];
        timeHorizon: string;
        sources: string[];
        targetPrice?: string | undefined;
    } | undefined> | undefined, unknown>;
    analystMemo: import("@langchain/langgraph").BaseChannel<{
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined, {
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | import("@langchain/langgraph").OverwriteValue<{
        executiveSummary: string;
        investmentThesis: string;
        financialHealth: string;
        riskAssessment: string;
        investmentRecommendation: string;
        conclusion: string;
        analystNote: string;
        dateGenerated: string;
        sources: string[];
    } | undefined> | undefined, unknown>;
    error: import("@langchain/langgraph").BaseChannel<string | undefined, string | import("@langchain/langgraph").OverwriteValue<string | undefined> | undefined, unknown>;
    completedAgents: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}, import("@langchain/langgraph").StateDefinition, {
    research: Partial<import("../types/investment").ResearchState>;
    financial: Partial<import("../types/investment").ResearchState>;
    news: Partial<import("../types/investment").ResearchState>;
    risk: Partial<import("../types/investment").ResearchState>;
    bullbear: Partial<import("../types/investment").ResearchState>;
    decision: Partial<import("../types/investment").ResearchState>;
    analystmemo: Partial<import("../types/investment").ResearchState>;
}, unknown, unknown, []>;
export type InvestmentGraphState = typeof ResearchStateAnnotation.State;
export {};
//# sourceMappingURL=investmentGraph.d.ts.map