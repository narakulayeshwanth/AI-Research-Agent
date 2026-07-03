import { withStructuredOutputFallback } from "../lib/llm";
import { fetchYahooFinanceData, searchTicker } from "../services/yahooFinance";
import { formatCurrency } from "../lib/scoring";
import { CompanyProfileSchema, type ResearchState } from "../types/investment";
import { z } from "zod";

/**
 * Minimal schema — only 6 fields.
 * The smaller NVIDIA 8B model handles this in ~5-10s vs 60s+ for 17 fields.
 * Yahoo Finance provides: name, mktCap, P/E, sector, industry, description, hq, website, exchange.
 * LLM only fills in: competitors, thesis, revenue, margin, revenueGrowth, employees.
 */
const LLMEnrichSchema = z.object({
  competitors: z.array(z.string()).max(5)
    .describe("Up to 5 main publicly-traded competitor ticker symbols"),
  investmentThesisSummary: z.string()
    .describe("One sentence core investment thesis for this stock"),
  estimatedRevenueBillions: z.number().nullable()
    .describe("Latest annual revenue in USD billions. Provide best estimate."),
  estimatedRevenueGrowthPct: z.number().nullable()
    .describe("YoY revenue growth in percent. Provide best estimate."),
  estimatedNetMarginPct: z.number().nullable()
    .describe("Net profit margin in percent. Provide best estimate."),
  estimatedEmployees: z.number().nullable()
    .describe("Full-time employee count. Provide best estimate."),
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

  // ── 2. Yahoo Finance (crumb-free endpoints) ───────────────────
  const yf = await fetchYahooFinanceData(ticker);
  const yfHasData = !!(yf.marketCap && yf.sector && yf.sector !== "Unknown");

  console.log(`[ResearchAgent] ${ticker}: yfHasData=${yfHasData}, mktCap=${yf.marketCap}, sector=${yf.sector}`);

  // ── 3. LLM enrichment — minimal prompt for fast 8B model ─────
  const prompt = `You are a financial analyst. For the stock ticker ${ticker} (${company}), provide:

1. competitors: List up to 5 publicly-traded competitor ticker symbols (e.g. ["MSFT","GOOGL","META"])
2. investmentThesisSummary: One sentence investment thesis
3. estimatedRevenueBillions: Annual revenue in USD billions (e.g. 60.9)
4. estimatedRevenueGrowthPct: YoY revenue growth % (e.g. 12.5)
5. estimatedNetMarginPct: Net profit margin % (e.g. 18.3)
6. estimatedEmployees: Full-time employee count (e.g. 29600)

Use your training knowledge. Provide realistic estimates — do not use null unless completely unknown.`;

  const enriched = await withStructuredOutputFallback(LLMEnrichSchema, prompt, { temperature: 0.1 });

  // ── 4. Merge: Yahoo Finance data takes priority ───────────────
  const marketCap = yf.marketCap ?? null;
  const revenue = enriched.estimatedRevenueBillions != null
    ? enriched.estimatedRevenueBillions * 1e9
    : null;
  const profitMarginPct = enriched.estimatedNetMarginPct;
  const revenueGrowthPct = enriched.estimatedRevenueGrowthPct;
  const netIncome = revenue && profitMarginPct != null
    ? revenue * (profitMarginPct / 100)
    : null;
  const peRatio = yf.peRatio ?? null;
  const employees = (yf.employees ?? enriched.estimatedEmployees) as number | null;
  const debtToEquity = yf.debtToEquity ?? null;
  const currentRatio = yf.currentRatio ?? null;

  // ── 5. Build profile ──────────────────────────────────────────
  const profile = CompanyProfileSchema.parse({
    name: yf.name !== ticker ? yf.name : (company || ticker),
    ticker,
    description: yf.description && yf.description.length > 80
      ? yf.description
      : `${yf.name || company} (${ticker}) is a publicly traded company in the ${yf.sector || "Unknown"} sector.`,
    sector: yf.sector !== "Unknown" ? yf.sector : "Unknown",
    industry: yf.industry !== "Unknown" ? yf.industry : "Unknown",
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
    headquarters: yf.headquarters || "N/A",
    website: yf.website || "",
    competitors: enriched.competitors,
    exchange: yf.exchange || "",
    currency: yf.currency || "USD",
    sources: yfHasData
      ? ["Yahoo Finance (quote + assetProfile)", "NVIDIA NIM LLM"]
      : ["NVIDIA NIM LLM (Yahoo Finance unavailable)"],
  });

  return {
    companyProfile: profile,
    completedAgents: [...state.completedAgents, "research"],
  };
}
