import { withStructuredOutputFallback } from "../lib/llm";
import { fetchYahooFinanceData, searchTicker } from "../services/yahooFinance";
import { formatCurrency } from "../lib/scoring";
import { CompanyProfileSchema, type ResearchState } from "../types/investment";
import { z } from "zod";

/**
 * Full enrichment schema — LLM provides ALL fields since Yahoo Finance
 * is blocked on Render's shared IP (crumb 429 on every request).
 * Using nullable() throughout (not optional()) for NVIDIA NIM compatibility.
 */
const LLMEnrichSchema = z.object({
  // Company identity
  name: z.string().describe("Full official company name, e.g. 'Amazon.com, Inc.'"),
  sector: z.string().describe("GICS sector, e.g. 'Consumer Cyclical', 'Technology'"),
  industry: z.string().describe("Specific industry, e.g. 'Internet Retail', 'Semiconductors'"),
  description: z.string().describe("1-2 sentence company overview"),
  headquarters: z.string().describe("City, State, Country e.g. 'Seattle, WA, USA'"),
  exchange: z.string().describe("NYSE, NASDAQ, etc."),
  // Competitors & thesis
  competitors: z.array(z.string()).max(5).describe("Up to 5 competitor ticker symbols"),
  investmentThesisSummary: z.string().describe("One sentence core investment thesis"),
  // Financials
  estimatedMarketCapBillions: z.number().nullable().describe("Market cap in USD billions"),
  estimatedRevenueBillions: z.number().nullable().describe("Annual revenue in USD billions"),
  estimatedRevenueGrowthPct: z.number().nullable().describe("YoY revenue growth %"),
  estimatedNetMarginPct: z.number().nullable().describe("Net profit margin %"),
  estimatedPERatio: z.number().nullable().describe("Trailing P/E ratio"),
  estimatedEmployees: z.number().nullable().describe("Full-time employee count"),
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

  // ── 2. Yahoo Finance (attempt crumb-free endpoints) ───────────
  // NOTE: On Render's shared IP, Yahoo Finance returns 429 for crumb.
  // YF data will be empty most of the time — LLM is the primary source.
  const yf = await fetchYahooFinanceData(ticker);
  const yfHasMarketCap = !!(yf.marketCap && yf.marketCap > 0);
  const yfHasSector = !!(yf.sector && yf.sector !== "Unknown");

  console.log(`[ResearchAgent] ${ticker}: yfMarketCap=${yfHasMarketCap}, yfSector=${yfHasSector}, mktCap=${yf.marketCap}`);

  // ── 3. LLM enrichment — provides ALL data since YF is blocked ─
  const prompt = `You are a financial data provider. For the publicly traded company ${ticker} (searched as "${company}"), provide accurate data from your training knowledge.

Return these fields with REAL, ACCURATE values — not estimates or approximations:
- name: full official company name (e.g. "Amazon.com, Inc.")
- sector: GICS sector (e.g. "Consumer Cyclical", "Technology", "Healthcare")
- industry: specific industry (e.g. "Internet Retail", "Cloud Computing", "Semiconductors")
- description: 1-2 sentences describing what the company does
- headquarters: city, state, country (e.g. "Seattle, WA, USA")
- exchange: stock exchange (e.g. "NASDAQ", "NYSE")
- competitors: up to 5 main competitor ticker symbols (e.g. ["MSFT","GOOGL","META"])
- investmentThesisSummary: one sentence core investment thesis
- estimatedMarketCapBillions: market cap in USD billions (e.g. 1850.5)
- estimatedRevenueBillions: latest annual revenue in USD billions
- estimatedRevenueGrowthPct: YoY revenue growth percentage
- estimatedNetMarginPct: net profit margin percentage
- estimatedPERatio: trailing price-to-earnings ratio
- estimatedEmployees: full-time employee count as integer

Use null only if you genuinely have no knowledge of the metric.`;

  const enriched = await withStructuredOutputFallback(LLMEnrichSchema, prompt, { temperature: 0.05 });

  // ── 4. Merge: Yahoo Finance takes priority where it worked ─────
  const marketCap = yfHasMarketCap
    ? yf.marketCap
    : enriched.estimatedMarketCapBillions != null
    ? enriched.estimatedMarketCapBillions * 1e9
    : null;

  const revenue = enriched.estimatedRevenueBillions != null
    ? enriched.estimatedRevenueBillions * 1e9
    : null;

  const profitMarginPct = enriched.estimatedNetMarginPct;
  const revenueGrowthPct = enriched.estimatedRevenueGrowthPct;
  const netIncome = revenue && profitMarginPct != null
    ? revenue * (profitMarginPct / 100)
    : null;

  const peRatio = yfHasMarketCap && yf.peRatio != null
    ? yf.peRatio
    : enriched.estimatedPERatio;

  const employees = (yf.employees ?? enriched.estimatedEmployees) as number | null;

  // ── 5. Build profile ──────────────────────────────────────────
  const profile = CompanyProfileSchema.parse({
    name: enriched.name || company,
    ticker,
    description: (yf.description && yf.description.length > 80)
      ? yf.description
      : enriched.description || `${enriched.name || company} (${ticker}) operates in the ${enriched.sector} sector.`,
    sector: yfHasSector ? yf.sector : (enriched.sector || "Unknown"),
    industry: (yf.industry && yf.industry !== "Unknown") ? yf.industry : (enriched.industry || "Unknown"),
    marketCap,
    marketCapFormatted: formatCurrency(marketCap),
    revenue,
    revenueFormatted: formatCurrency(revenue),
    revenueGrowthPct,
    netIncome,
    netIncomeFormatted: formatCurrency(netIncome),
    profitMarginPct,
    debtToEquity: yf.debtToEquity ?? null,
    peRatio,
    currentRatio: yf.currentRatio ?? null,
    employees,
    headquarters: yf.headquarters || enriched.headquarters || "N/A",
    website: yf.website || "",
    competitors: enriched.competitors,
    exchange: yf.exchange || enriched.exchange || "",
    currency: yf.currency || "USD",
    sources: yfHasMarketCap
      ? ["Yahoo Finance (quote)", "NVIDIA NIM LLM"]
      : ["NVIDIA NIM LLM"],
  });

  return {
    companyProfile: profile,
    completedAgents: [...state.completedAgents, "research"],
  };
}
