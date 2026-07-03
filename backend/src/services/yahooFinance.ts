import YahooFinanceClass from "yahoo-finance2";
import { withCache } from "../lib/cache";

// Instantiate yahoo-finance2 v3 — use new YahooFinance() per v3 API
const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey"] });

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
  forwardPE: number | null;
  currentRatio: number | null;
  beta: number | null;
  week52High: number | null;
  week52Low: number | null;
}

/**
 * Fetch Yahoo Finance data using only endpoints that work without a crumb:
 *  - quote()        → market cap, P/E, forward P/E, 52-week range, EPS, exchange, currency
 *  - quoteSummary() → assetProfile only (sector, industry, description, employees, website, hq)
 *
 * NOTE: financialData / summaryDetail modules require a crumb, which gets rate-limited (429)
 * on shared server IPs (Render). We intentionally avoid those modules here.
 */
async function _fetchYahooFinanceData(ticker: string): Promise<YahooFinanceData> {
  console.log(`[YahooFinance2] Fetching data for ${ticker}...`);

  // Run both calls in parallel for speed
  const [quoteResult, profileResult] = await Promise.allSettled([
    yahooFinance.quote(ticker),
    yahooFinance.quoteSummary(ticker, { modules: ["assetProfile"] }),
  ]);

  const q = quoteResult.status === "fulfilled" ? quoteResult.value : null;
  const p = profileResult.status === "fulfilled"
    ? profileResult.value?.assetProfile
    : null;

  if (quoteResult.status === "rejected") {
    console.warn(`[YahooFinance2] quote() failed for ${ticker}:`, quoteResult.reason?.message);
  }
  if (profileResult.status === "rejected") {
    console.warn(`[YahooFinance2] quoteSummary(assetProfile) failed for ${ticker}:`, profileResult.reason?.message);
  }

  if (!q && !p) {
    console.warn(`[YahooFinance2] Both calls failed for ${ticker}, returning empty data`);
    return emptyData(ticker);
  }

  const name = String(q?.longName ?? q?.shortName ?? ticker);
  const hq = [p?.city, p?.state, p?.country].filter(Boolean).join(", ");

  // EPS × shares gives approximate revenue proxy — but prefer explicit data
  // Market cap / P/E × margin ≈ revenue is too rough; omit revenue if unavailable
  const marketCap = (q?.marketCap as number | undefined) ?? null;
  const peRatio = (q?.trailingPE as number | undefined) ?? null;

  console.log(
    `[YahooFinance2] ${ticker}: name=${name}, sector=${p?.sector}, mktCap=${marketCap}, pe=${peRatio}`
  );

  return {
    ticker,
    name,
    description: p?.longBusinessSummary ?? "",
    sector: p?.sector ?? "Unknown",
    industry: p?.industry ?? "Unknown",
    exchange: String(q?.exchange ?? q?.fullExchangeName ?? ""),
    currency: String(q?.currency ?? "USD"),
    website: p?.website ?? "",
    headquarters: hq,
    employees: (p?.fullTimeEmployees as number | undefined) ?? null,
    marketCap,
    // Revenue and growth not available without crumb — LLM will fill in
    revenue: null,
    revenueGrowthPct: null,
    netIncome: null,
    profitMarginPct: null,
    debtToEquity: null,
    peRatio,
    forwardPE: (q?.forwardPE as number | undefined) ?? null,
    currentRatio: null,
    beta: null,
    week52High: (q?.fiftyTwoWeekHigh as number | undefined) ?? null,
    week52Low: (q?.fiftyTwoWeekLow as number | undefined) ?? null,
  };
}

function emptyData(ticker: string): YahooFinanceData {
  return {
    ticker,
    name: ticker,
    description: "",
    sector: "Unknown",
    industry: "Unknown",
    exchange: "",
    currency: "USD",
    website: "",
    headquarters: "",
    employees: null,
    marketCap: null,
    revenue: null,
    revenueGrowthPct: null,
    netIncome: null,
    profitMarginPct: null,
    debtToEquity: null,
    peRatio: null,
    forwardPE: null,
    currentRatio: null,
    beta: null,
    week52High: null,
    week52Low: null,
  };
}

/** Cached Yahoo Finance fetch — 15 minute TTL */
export const fetchYahooFinanceData = withCache(
  _fetchYahooFinanceData,
  "yahoo-finance2",
  900
);

/** Well-known company → ticker mapping for common searches (avoids API calls entirely) */
const KNOWN_TICKERS: Record<string, string> = {
  apple: "AAPL",
  microsoft: "MSFT",
  google: "GOOGL",
  alphabet: "GOOGL",
  amazon: "AMZN",
  meta: "META",
  facebook: "META",
  nvidia: "NVDA",
  tesla: "TSLA",
  netflix: "NFLX",
  "berkshire hathaway": "BRK-B",
  "johnson & johnson": "JNJ",
  "johnson and johnson": "JNJ",
  jpmorgan: "JPM",
  "jp morgan": "JPM",
  visa: "V",
  mastercard: "MA",
  walmart: "WMT",
  "procter & gamble": "PG",
  "procter and gamble": "PG",
  "united health": "UNH",
  unitedhealth: "UNH",
  exxon: "XOM",
  "exxon mobil": "XOM",
  chevron: "CVX",
  "home depot": "HD",
  "coca cola": "KO",
  "coca-cola": "KO",
  abbvie: "ABBV",
  pfizer: "PFE",
  merck: "MRK",
  broadcom: "AVGO",
  "eli lilly": "LLY",
  costco: "COST",
  salesforce: "CRM",
  adobe: "ADBE",
  qualcomm: "QCOM",
  amd: "AMD",
  intel: "INTC",
  oracle: "ORCL",
  ibm: "IBM",
  paypal: "PYPL",
  shopify: "SHOP",
  "uber technologies": "UBER",
  uber: "UBER",
  lyft: "LYFT",
  airbnb: "ABNB",
  spotify: "SPOT",
  twitter: "X",
  snap: "SNAP",
  pinterest: "PINS",
  zoom: "ZM",
  "zoom video": "ZM",
  palantir: "PLTR",
  coinbase: "COIN",
  robinhood: "HOOD",
  amc: "AMC",
  gamestop: "GME",
  boeing: "BA",
  lockheed: "LMT",
  raytheon: "RTX",
  ford: "F",
  "general motors": "GM",
  toyota: "TM",
  disney: "DIS",
  comcast: "CMCSA",
  "at&t": "T",
  verizon: "VZ",
  "t-mobile": "TMUS",
  "bank of america": "BAC",
  "wells fargo": "WFC",
  citigroup: "C",
  goldman: "GS",
  "morgan stanley": "MS",
};

/** Search for ticker symbol from company name */
async function _searchTicker(companyName: string): Promise<string | null> {
  const upper = companyName.toUpperCase().trim();
  const lower = companyName.toLowerCase().trim();

  // 1. Direct ticker shortcut (e.g. user typed "NVDA" or "TSLA")
  if (/^[A-Z]{1,5}$/.test(upper)) {
    console.log(`[YahooFinance] Direct ticker: ${upper}`);
    return upper;
  }

  // 2. Known company lookup (instant, no API call)
  if (KNOWN_TICKERS[lower]) {
    console.log(`[YahooFinance] Known ticker for "${companyName}": ${KNOWN_TICKERS[lower]}`);
    return KNOWN_TICKERS[lower];
  }

  // 3. yahoo-finance2 search (uses /v1/finance/search, no crumb needed)
  try {
    console.log(`[YahooFinance2] Searching for: ${companyName}`);
    const results = await yahooFinance.search(companyName);
    const quotes = results.quotes ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const equity = quotes.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any) => q.quoteType === "EQUITY" && q.symbol && !q.symbol.includes(".")
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (equity as any)?.symbol ?? (quotes[0] as any)?.symbol ?? null;
    if (result) {
      console.log(`[YahooFinance2] Found ticker: ${result}`);
      return result;
    }
  } catch (err: unknown) {
    console.warn(`[YahooFinance2] Search failed (${(err as Error)?.message}), trying Alpha Vantage...`);
  }

  // 4. Alpha Vantage SYMBOL_SEARCH as last resort
  console.log(`[YahooFinance] Falling back to Alpha Vantage symbol search for: ${companyName}`);
  return searchViaAlphaVantage(companyName);
}

async function searchViaAlphaVantage(keywords: string): Promise<string | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;
  try {
    const axios = (await import("axios")).default;
    const { data } = await axios.get("https://www.alphavantage.co/query", {
      params: { function: "SYMBOL_SEARCH", keywords, apikey: apiKey },
      timeout: 15000,
    });
    if (data?.Information || data?.Note) {
      console.warn("[AlphaVantage] Rate limited on SYMBOL_SEARCH");
      return null;
    }
    const matches = data?.bestMatches ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const equity = matches.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m["4. region"] === "United States" && m["3. type"] === "Equity"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (equity as any)?.["1. symbol"] ?? null;
    if (result) console.log(`[AlphaVantage] Found ticker: ${result}`);
    return result;
  } catch (err: unknown) {
    console.warn("[AlphaVantage] Symbol search error:", (err as Error)?.message);
    return null;
  }
}

export const searchTicker = withCache(_searchTicker, "yahoo-search", 3600);
