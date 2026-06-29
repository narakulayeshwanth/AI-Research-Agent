export interface YahooFinanceData {
    ticker: string;
    name: string;
    description: string;
    sector: string;
    industry: string;
    exchange: string;
    currency: string;
    website: string;
    headquarters: string;
    employees: number | null;
    marketCap: number | null;
    revenue: number | null;
    revenueGrowthPct: number | null;
    netIncome: number | null;
    profitMarginPct: number | null;
    debtToEquity: number | null;
    peRatio: number | null;
    currentRatio: number | null;
}
export declare const fetchYahooFinanceData: (ticker: string) => Promise<YahooFinanceData>;
export declare const searchTicker: (companyName: string) => Promise<string | null>;
//# sourceMappingURL=yahooFinance.d.ts.map