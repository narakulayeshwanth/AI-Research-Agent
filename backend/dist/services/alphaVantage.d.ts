export interface AlphaVantageData {
    ticker: string;
    name: string;
    description: string;
    sector: string;
    industry: string;
    exchange: string;
    currency: string;
    country: string;
    employees: number | null;
    website: string;
    marketCap: number | null;
    revenue: number | null;
    revenueGrowthYOY: number | null;
    ebitda: number | null;
    netIncome: number | null;
    profitMarginPct: number | null;
    operatingMarginPct: number | null;
    returnOnEquityPct: number | null;
    returnOnAssetsPct: number | null;
    peRatio: number | null;
    forwardPE: number | null;
    pegRatio: number | null;
    priceToBook: number | null;
    eps: number | null;
    bookValue: number | null;
    debtToEquity: number | null;
    currentRatio: number | null;
    beta: number | null;
    analystTargetPrice: number | null;
    week52High: number | null;
    week52Low: number | null;
    dividendYield: number | null;
}
/** Cached Alpha Vantage fetch — 15 minute TTL */
export declare const fetchAlphaVantageData: (ticker: string) => Promise<AlphaVantageData>;
//# sourceMappingURL=alphaVantage.d.ts.map