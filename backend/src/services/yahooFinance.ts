import YahooFinanceClass from "yahoo-finance2";
import { withCache } from "../lib/cache";

// Instantiate yahoo-finance2 v3 (requires `new` in v3)
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

async function _fetchYahooFinanceData(ticker: string): Promise<YahooFinanceData> {
  try {
    console.log(`[YahooFinance2] Fetching quoteSummary for ${ticker}...`);

    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ["assetProfile", "financialData", "summaryDetail", "defaultKeyStatistics"],
    });

    const profile = result.assetProfile;
    const financial = result.financialData;
    const summary = result.summaryDetail;
    const keyStats = result.defaultKeyStatistics;

    const name = String(profile?.longName ?? ticker);
    const hq = [profile?.city, profile?.state, profile?.country]
      .filter(Boolean)
      .join(", ");

    // Revenue growth comes as a decimal from Yahoo (e.g. 0.166 = 16.6%)
    const revenueGrowthPct =
      financial?.revenueGrowth != null
        ? financial.revenueGrowth * 100
        : null;

    // Profit margin comes as a decimal (e.g. 0.122 = 12.2%)
    const profitMarginPct =
      financial?.profitMargins != null
        ? financial.profitMargins * 100
        : null;

    // Compute net income from revenue × margin if not directly available
    const revenue = financial?.totalRevenue ?? null;
    const netIncome =
      revenue != null && profitMarginPct != null
        ? revenue * (profitMarginPct / 100)
        : null;

    console.log(
      `[YahooFinance2] ${ticker}: sector=${profile?.sector}, mktCap=${summary?.marketCap}, revenue=${revenue}`
    );

    return {
      ticker,
      name,
      description: profile?.longBusinessSummary ?? "",
      sector: profile?.sector ?? "Unknown",
      industry: profile?.industry ?? "Unknown",
      exchange: String(keyStats?.exchange ?? ""),
      currency: summary?.currency ?? "USD",
      website: profile?.website ?? "",
      headquarters: hq,
      employees: profile?.fullTimeEmployees ?? null,
      marketCap: summary?.marketCap ?? null,
      revenue,
      revenueGrowthPct,
      netIncome,
      profitMarginPct,
      debtToEquity: financial?.debtToEquity ?? null,
      peRatio: summary?.trailingPE ?? null,
      forwardPE: summary?.forwardPE ?? null,
      currentRatio: financial?.currentRatio ?? null,
      beta: summary?.beta ?? null,
      week52High: summary?.fiftyTwoWeekHigh ?? null,
      week52Low: summary?.fiftyTwoWeekLow ?? null,
    };
  } catch (err) {
    console.warn(`[YahooFinance2] Error for ${ticker}:`, (err as Error).message);
    return emptyData(ticker);
  }
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

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
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

  // 3. yahoo-finance2 search (no rate limit)
  try {
    console.log(`[YahooFinance2] Searching for: ${companyName}`);
    const results = await yahooFinance.search(companyName);
    const quotes = results.quotes ?? [];
    const equity = quotes.find(
      (q: any) => q.quoteType === "EQUITY" && q.symbol && !q.symbol.includes(".")
    );
    const result = (equity as any)?.symbol ?? (quotes[0] as any)?.symbol ?? null;
    if (result) {
      console.log(`[YahooFinance2] Found ticker: ${result}`);
      return result;
    }
  } catch (err: any) {
    console.warn(`[YahooFinance2] Search failed (${err?.message}), trying REST fallback...`);
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
    const equity = matches.find(
      (m: any) => m["4. region"] === "United States" && m["3. type"] === "Equity"
    );
    const result = equity?.["1. symbol"] ?? null;
    if (result) console.log(`[AlphaVantage] Found ticker: ${result}`);
    return result;
  } catch (err: any) {
    console.warn("[AlphaVantage] Symbol search error:", err?.message);
    return null;
  }
}

export const searchTicker = withCache(_searchTicker, "yahoo-search", 3600);
