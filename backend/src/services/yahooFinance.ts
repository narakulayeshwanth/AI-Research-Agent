import axios from "axios";
import { withCache } from "../lib/cache";

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

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
};

/** Returns empty data — Yahoo Finance REST has deprecated unauthenticated access.
 *  Primary financial data now comes from Alpha Vantage. */
async function _fetchYahooFinanceData(ticker: string): Promise<YahooFinanceData> {
  return emptyData(ticker);
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
    currentRatio: null,
  };
}

export const fetchYahooFinanceData = withCache(
  _fetchYahooFinanceData,
  "yahoo-finance",
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

/** Search for ticker symbol from company name via Yahoo Finance search (still public) */
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

  // 3. Yahoo Finance search (with generous timeout)
  try {
    console.log(`[YahooFinance] Searching Yahoo for: ${companyName}`);
    const { data } = await axios.get(
      "https://query1.finance.yahoo.com/v1/finance/search",
      {
        headers: HEADERS,
        params: { q: companyName, quotesCount: 5, newsCount: 0 },
        timeout: 15000, // increased from 8s to 15s
      }
    );

    const quotes: any[] = data?.quotes ?? [];
    const equity = quotes.find(
      (q) =>
        q.quoteType === "EQUITY" &&
        q.symbol &&
        !q.symbol.includes(".") // prefer US-listed
    );
    const result = equity?.symbol ?? quotes[0]?.symbol ?? null;
    if (result) {
      console.log(`[YahooFinance] Found ticker: ${result}`);
      return result;
    }
  } catch (err: any) {
    console.warn(`[YahooFinance] query1 failed (${err?.message}), trying query2...`);
  }

  // 4. Retry with query2 endpoint
  try {
    const { data } = await axios.get(
      "https://query2.finance.yahoo.com/v1/finance/search",
      {
        headers: HEADERS,
        params: { q: companyName, quotesCount: 5, newsCount: 0 },
        timeout: 15000,
      }
    );

    const quotes: any[] = data?.quotes ?? [];
    const equity = quotes.find(
      (q) => q.quoteType === "EQUITY" && q.symbol && !q.symbol.includes(".")
    );
    const result = equity?.symbol ?? quotes[0]?.symbol ?? null;
    if (result) {
      console.log(`[YahooFinance] Found ticker via query2: ${result}`);
      return result;
    }
  } catch (err: any) {
    console.warn(`[YahooFinance] query2 also failed: ${err?.message}`);
  }

  // 5. Alpha Vantage SYMBOL_SEARCH as last resort
  console.log(`[YahooFinance] Falling back to Alpha Vantage symbol search for: ${companyName}`);
  return searchViaAlphaVantage(companyName);
}

async function searchViaAlphaVantage(keywords: string): Promise<string | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;
  try {
    const { data } = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "SYMBOL_SEARCH",
        keywords,
        apikey: apiKey,
      },
      timeout: 15000, // increased from 8s
    });

    if (data?.Information || data?.Note) {
      console.warn("[AlphaVantage] Rate limited on SYMBOL_SEARCH");
      return null;
    }

    const matches = data?.bestMatches ?? [];
    const equity = matches.find(
      (m: any) =>
        m["4. region"] === "United States" && m["3. type"] === "Equity"
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
