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

/** Search for ticker symbol from company name via Yahoo Finance search (still public) */
async function _searchTicker(companyName: string): Promise<string | null> {
  try {
    // Direct ticker shortcut (e.g. user typed "NVDA" or "TSLA")
    const upper = companyName.toUpperCase().trim();
    if (/^[A-Z]{1,5}$/.test(upper)) return upper;

    // Yahoo Finance search endpoint (still works without auth)
    const { data } = await axios.get(
      "https://query2.finance.yahoo.com/v1/finance/search",
      {
        headers: HEADERS,
        params: { q: companyName, quotesCount: 5, newsCount: 0 },
        timeout: 8000,
      }
    );

    const quotes: any[] = data?.quotes ?? [];
    const equity = quotes.find(
      (q) =>
        q.quoteType === "EQUITY" &&
        q.symbol &&
        !q.symbol.includes(".") // prefer US-listed
    );
    return equity?.symbol ?? quotes[0]?.symbol ?? null;
  } catch (err: any) {
    console.error("[YahooFinance] Search error:", err?.message);
    return searchViaAlphaVantage(companyName);
  }
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
      timeout: 8000,
    });
    const matches = data?.bestMatches ?? [];
    const equity = matches.find(
      (m: any) =>
        m["4. region"] === "United States" && m["3. type"] === "Equity"
    );
    return equity?.["1. symbol"] ?? null;
  } catch {
    return null;
  }
}

export const searchTicker = withCache(_searchTicker, "yahoo-search", 3600);
