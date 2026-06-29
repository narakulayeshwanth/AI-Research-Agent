import { getLLM } from "@/lib/llm";
import { searchTicker } from "@/services/yahooFinance";
import { fetchAlphaVantageData } from "@/services/alphaVantage";
import { formatCurrency } from "@/lib/scoring";
import { CompanyProfileSchema, type ResearchState } from "@/types/investment";
import { z } from "zod";

// Full enrichment schema — includes financial fallbacks when Alpha Vantage is rate-limited
const LLMEnrichSchema = z.object({
  name: z.string().describe("Full official company name"),
  description: z.string().describe("2-3 sentence company description"),
  headquarters: z.string().describe("City, State, Country (e.g. 'Austin, TX, USA')"),
  website: z.string().describe("Official website URL (e.g. 'https://tesla.com')"),
  competitors: z.array(z.string()).max(5).describe("3-5 main publicly-traded competitors"),
  exchange: z.string().describe("Stock exchange: NYSE, NASDAQ, etc."),
  currency: z.string().describe("Trading currency, usually USD"),
  sector: z.string().describe("GICS sector (e.g. 'Technology', 'Consumer Cyclical')"),
  industry: z.string().describe("Specific industry (e.g. 'Semiconductors', 'Electric Vehicles')"),
  investmentThesisSummary: z.string().describe("1 sentence core investment thesis"),
  // Financial estimates — used as fallback when Alpha Vantage is rate-limited
  estimatedMarketCapBillions: z.number().nullable().describe("Market cap in USD billions (approximate, from your knowledge). Null if unknown."),
  estimatedRevenueBillions: z.number().nullable().describe("Annual revenue in USD billions (TTM, approximate). Null if unknown."),
  estimatedRevenueGrowthPct: z.number().nullable().describe("YoY revenue growth % (approximate). Null if unknown."),
  estimatedNetMarginPct: z.number().nullable().describe("Net profit margin % (approximate). Null if unknown."),
  estimatedPERatio: z.number().nullable().describe("Trailing P/E ratio (approximate). Null if unknown."),
  estimatedEmployees: z.number().nullable().describe("Full-time employee count (approximate). Null if unknown."),
  estimatedDebtToEquity: z.number().nullable().describe("Debt-to-equity ratio (approximate). Null if unknown."),
  estimatedCurrentRatio: z.number().nullable().describe("Current ratio (approximate). Null if unknown."),
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

  // ── 2. Alpha Vantage (primary source) ─────────────────────────
  const av = await fetchAlphaVantageData(ticker);
  const avHasData = !!(av.name && av.name !== ticker && av.marketCap);

  // ── 3. LLM enrichment + financial fallback ────────────────────
  const llm = getLLM({ temperature: 0.1 });
  const structuredLLM = llm.withStructuredOutput(LLMEnrichSchema);

  const prompt = `You are a financial research analyst. Provide structured information about the company with ticker: ${ticker} (user searched: "${company}").

${avHasData ? `
ALPHA VANTAGE DATA (AVAILABLE — use this, just fill in missing fields):
- Company: ${av.name}
- Sector: ${av.sector}
- Industry: ${av.industry}
- Exchange: ${av.exchange}
- Country: ${av.country}
- Description: ${av.description?.slice(0, 300) ?? "N/A"}
- Market Cap: $${av.marketCap ? (av.marketCap / 1e9).toFixed(1) + "B" : "N/A"}
- Revenue (TTM): $${av.revenue ? (av.revenue / 1e9).toFixed(1) + "B" : "N/A"}
- Revenue Growth: ${av.revenueGrowthYOY?.toFixed(1) ?? "N/A"}%
- Net Margin: ${av.profitMarginPct?.toFixed(1) ?? "N/A"}%
- P/E Ratio: ${av.peRatio?.toFixed(1) ?? "N/A"}x
- Employees: ${av.employees?.toLocaleString() ?? "N/A"}
` : `
ALPHA VANTAGE: Rate limited (no data). Use your training knowledge to provide REAL estimated financial data for ${ticker}.
This is CRITICAL — provide your best estimates for the financial fields below.
`}

REQUIRED OUTPUT:
1. name: Full company name
2. description: 2-3 sentence company overview
3. headquarters: City, State, Country
4. website: Official URL
5. competitors: 3-5 main publicly traded competitors (ticker symbols preferred)
6. exchange: NYSE/NASDAQ/etc.
7. currency: USD
8. sector: GICS sector classification
9. industry: Specific industry
10. investmentThesisSummary: 1-sentence core thesis

FINANCIAL ESTIMATES (provide even if approximate — these power the scoring engine):
11. estimatedMarketCapBillions: Market cap in billions USD
12. estimatedRevenueBillions: Annual revenue in billions USD
13. estimatedRevenueGrowthPct: YoY revenue growth %
14. estimatedNetMarginPct: Net profit margin %
15. estimatedPERatio: Trailing P/E ratio
16. estimatedEmployees: Full-time employees
17. estimatedDebtToEquity: Debt-to-equity ratio
18. estimatedCurrentRatio: Current ratio

Be accurate with known companies. Use null only for genuinely unknown metrics.`;

  const enriched = await structuredLLM.invoke(prompt);

  // ── 4. Merge: prefer Alpha Vantage real data, fall back to LLM estimates ──
  const marketCap = avHasData && av.marketCap
    ? av.marketCap
    : enriched.estimatedMarketCapBillions != null
    ? enriched.estimatedMarketCapBillions * 1e9
    : null;

  const revenue = avHasData && av.revenue
    ? av.revenue
    : enriched.estimatedRevenueBillions != null
    ? enriched.estimatedRevenueBillions * 1e9
    : null;

  const revenueGrowthPct = avHasData && av.revenueGrowthYOY != null
    ? av.revenueGrowthYOY
    : enriched.estimatedRevenueGrowthPct;

  const profitMarginPct = avHasData && av.profitMarginPct != null
    ? av.profitMarginPct
    : enriched.estimatedNetMarginPct;

  const netIncome = av.netIncome ?? (
    revenue && profitMarginPct != null
      ? revenue * (profitMarginPct / 100)
      : null
  );

  const peRatio = avHasData && (av.peRatio ?? av.forwardPE)
    ? av.peRatio ?? av.forwardPE
    : enriched.estimatedPERatio;

  const employees = avHasData && av.employees
    ? av.employees
    : enriched.estimatedEmployees;

  const debtToEquity = avHasData && av.debtToEquity != null
    ? av.debtToEquity
    : enriched.estimatedDebtToEquity;

  const currentRatio = avHasData && av.currentRatio != null
    ? av.currentRatio
    : enriched.estimatedCurrentRatio;

  // ── 5. Build profile ──────────────────────────────────────────
  const profile = CompanyProfileSchema.parse({
    name: avHasData ? av.name : enriched.name,
    ticker,
    description:
      av.description && av.description.length > 80
        ? av.description
        : enriched.description,
    sector:
      (av.sector && av.sector !== "Unknown") ? av.sector : enriched.sector,
    industry:
      (av.industry && av.industry !== "Unknown") ? av.industry : enriched.industry,
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
    headquarters: enriched.headquarters,
    website: enriched.website,
    competitors: enriched.competitors,
    exchange: (av.exchange && avHasData) ? av.exchange : enriched.exchange,
    currency: av.currency || enriched.currency || "USD",
    sources: avHasData
      ? ["Alpha Vantage", "NVIDIA NIM LLM"]
      : ["NVIDIA NIM LLM (estimated — Alpha Vantage rate limited)"],
  });

  return {
    companyProfile: profile,
    completedAgents: [...state.completedAgents, "research"],
  };
}
