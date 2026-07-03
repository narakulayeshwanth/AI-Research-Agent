import { withStructuredOutputFallback } from "../lib/llm";
import { fetchYahooFinanceData, searchTicker } from "../services/yahooFinance";
import { formatCurrency } from "../lib/scoring";
import { CompanyProfileSchema, type ResearchState } from "../types/investment";
import { z } from "zod";

// LLM enrichment schema — only things Yahoo Finance doesn't provide
const LLMEnrichSchema = z.object({
  competitors: z.array(z.string()).max(5).describe("3-5 main publicly-traded competitors (tickers preferred)"),
  investmentThesisSummary: z.string().describe("1 sentence core investment thesis"),
  // Financial fallbacks — used only if Yahoo Finance returns no data
  estimatedMarketCapBillions: z.number().nullable().describe("Market cap in USD billions. Null if unknown."),
  estimatedRevenueBillions: z.number().nullable().describe("Annual revenue in USD billions. Null if unknown."),
  estimatedRevenueGrowthPct: z.number().nullable().describe("YoY revenue growth %. Null if unknown."),
  estimatedNetMarginPct: z.number().nullable().describe("Net profit margin %. Null if unknown."),
  estimatedPERatio: z.number().nullable().describe("Trailing P/E ratio. Null if unknown."),
  estimatedDebtToEquity: z.number().nullable().describe("Debt-to-equity ratio. Null if unknown."),
  estimatedCurrentRatio: z.number().nullable().describe("Current ratio. Null if unknown."),
  estimatedEmployees: z.number().nullable().describe("Full-time employee count. Null if unknown."),
  // Required fallbacks if Yahoo doesn't return them
  name: z.string().describe("Full official company name"),
  description: z.string().describe("2-3 sentence company description"),
  headquarters: z.string().describe("City, State, Country (e.g. 'Seattle, WA, USA')"),
  website: z.string().describe("Official website URL"),
  exchange: z.string().describe("Stock exchange: NYSE, NASDAQ, etc."),
  sector: z.string().describe("GICS sector"),
  industry: z.string().describe("Specific industry"),
});

export async function researchAgent(
  state: ResearchState
): Promise<Partial<ResearchState>> {
  const company = state.company;

  // ── 1. Ticker lookup ──────────────────────────────────────────
  const ticker = await searchTicker(company);
  if (!ticker) {
    throw new Error(
      `Could not find a stock ticker for "${company}". ` +
      `Try the official company name (e.g. "NVIDIA", "Tesla") or ticker symbol (e.g. "NVDA", "TSLA").`
    );
  }

  // ── 2. Yahoo Finance (primary — no rate limits, no API key) ───
  const yf = await fetchYahooFinanceData(ticker);
  const yfHasData = !!(yf.marketCap && yf.sector && yf.sector !== "Unknown");

  console.log(`[ResearchAgent] ${ticker}: yfHasData=${yfHasData}, mktCap=${yf.marketCap}`);

  // ── 3. LLM enrichment (competitors, thesis + fallback financials) ──
  const prompt = `You are a financial research analyst. Provide structured information about the company with ticker: ${ticker} (user searched: "${company}").

${yfHasData ? `
YAHOO FINANCE DATA (AVAILABLE — use this as ground truth for fields below):
- Company: ${yf.name}
- Sector: ${yf.sector}
- Industry: ${yf.industry}
- Headquarters: ${yf.headquarters}
- Website: ${yf.website}
- Description: ${yf.description?.slice(0, 300) ?? "N/A"}
- Market Cap: $${yf.marketCap ? (yf.marketCap / 1e9).toFixed(1) + "B" : "N/A"}
- Revenue (TTM): $${yf.revenue ? (yf.revenue / 1e9).toFixed(1) + "B" : "N/A"}
- Revenue Growth: ${yf.revenueGrowthPct?.toFixed(1) ?? "N/A"}%
- Net Margin: ${yf.profitMarginPct?.toFixed(1) ?? "N/A"}%
- P/E Ratio: ${yf.peRatio?.toFixed(1) ?? "N/A"}x
- Employees: ${yf.employees?.toLocaleString() ?? "N/A"}
- D/E Ratio: ${yf.debtToEquity?.toFixed(2) ?? "N/A"}

Since financial data is available, set all "estimated*" fields to null.
` : `
YAHOO FINANCE: No data available. Use your training knowledge to provide REAL estimated financial data for ${ticker}.
This is CRITICAL — provide your best estimates for the financial fields below.
`}

REQUIRED OUTPUT:
1. name: Full company name (use Yahoo Finance data if available)
2. description: 2-3 sentence company overview
3. headquarters: City, State, Country
4. website: Official URL
5. exchange: NYSE/NASDAQ/etc.
6. sector: GICS sector classification
7. industry: Specific industry
8. competitors: 3-5 main publicly traded competitors (ticker symbols preferred)
9. investmentThesisSummary: 1-sentence core investment thesis

FINANCIAL ESTIMATES (only needed if Yahoo Finance data is missing above):
10. estimatedMarketCapBillions: null if Yahoo data available, else provide estimate
11. estimatedRevenueBillions: null if Yahoo data available, else provide estimate
12. estimatedRevenueGrowthPct: null if Yahoo data available, else provide estimate
13. estimatedNetMarginPct: null if Yahoo data available, else provide estimate
14. estimatedPERatio: null if Yahoo data available, else provide estimate
15. estimatedDebtToEquity: null if Yahoo data available, else provide estimate
16. estimatedCurrentRatio: null if Yahoo data available, else provide estimate
17. estimatedEmployees: null if Yahoo data available, else provide estimate

Be accurate. Use null only for genuinely unknown metrics.`;

  const enriched = await withStructuredOutputFallback(LLMEnrichSchema, prompt, { temperature: 0.1 });

  // ── 4. Merge: prefer Yahoo Finance real data, fall back to LLM estimates ──
  const marketCap = yfHasData && yf.marketCap
    ? yf.marketCap
    : enriched.estimatedMarketCapBillions != null
    ? enriched.estimatedMarketCapBillions * 1e9
    : null;

  const revenue = yfHasData && yf.revenue
    ? yf.revenue
    : enriched.estimatedRevenueBillions != null
    ? enriched.estimatedRevenueBillions * 1e9
    : null;

  const revenueGrowthPct = yfHasData && yf.revenueGrowthPct != null
    ? yf.revenueGrowthPct
    : enriched.estimatedRevenueGrowthPct;

  const profitMarginPct = yfHasData && yf.profitMarginPct != null
    ? yf.profitMarginPct
    : enriched.estimatedNetMarginPct;

  const netIncome = yf.netIncome ?? (
    revenue && profitMarginPct != null
      ? revenue * (profitMarginPct / 100)
      : null
  );

  const peRatio = yfHasData && yf.peRatio != null
    ? yf.peRatio
    : enriched.estimatedPERatio;

  const employees = yfHasData && yf.employees
    ? yf.employees
    : enriched.estimatedEmployees;

  const debtToEquity = yfHasData && yf.debtToEquity != null
    ? yf.debtToEquity
    : enriched.estimatedDebtToEquity;

  const currentRatio = yfHasData && yf.currentRatio != null
    ? yf.currentRatio
    : enriched.estimatedCurrentRatio;

  // ── 5. Build profile ──────────────────────────────────────────
  const profile = CompanyProfileSchema.parse({
    name: yfHasData && yf.name !== ticker ? yf.name : enriched.name,
    ticker,
    description:
      yf.description && yf.description.length > 80
        ? yf.description
        : enriched.description,
    sector:
      (yf.sector && yf.sector !== "Unknown") ? yf.sector : enriched.sector,
    industry:
      (yf.industry && yf.industry !== "Unknown") ? yf.industry : enriched.industry,
    marketCap,
    marketCapFormatted: formatCurrency(marketCap),
    revenue,
    revenueFormatted: formatCurrency(revenue),
    revenueGrowthPct,
    netIncome,
    netIncomeFormatted: formatCurrency(netIncome),
    profitMarginPct,
    debtToEquity,
    peRatio,
    currentRatio,
    employees,
    headquarters: yf.headquarters || enriched.headquarters,
    website: yf.website || enriched.website,
    competitors: enriched.competitors,
    exchange: yf.exchange || enriched.exchange,
    currency: yf.currency || "USD",
    sources: yfHasData
      ? ["Yahoo Finance (yahoo-finance2)", "LLM Enrichment"]
      : ["LLM Enrichment (Yahoo Finance unavailable)"],
  });

  return {
    companyProfile: profile,
    completedAgents: [...state.completedAgents, "research"],
  };
}
