import { unstable_cache } from "next/cache";
import axios from "axios";

export interface AlphaVantageData {
  ticker: string;
  // Company info
  name: string;
  description: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  country: string;
  employees: number | null;
  website: string;
  // Financials
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

async function _fetchAlphaVantageData(ticker: string): Promise<AlphaVantageData> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.warn("[AlphaVantage] No API key — returning empty data.");
    return emptyData(ticker);
  }

  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
    const { data } = await axios.get(url, { timeout: 12000 });

    if (!data?.Symbol || data.Note || data.Information) {
      // Rate limit hit or no data
      console.warn("[AlphaVantage] Rate limit or no data for", ticker, data?.Note ?? data?.Information ?? "");
      return emptyData(ticker);
    }

    const p = (key: string): number | null => {
      const v = parseFloat(data[key]);
      return isNaN(v) || v === 0 ? null : v;
    };
    const s = (key: string): string => data[key] ?? "";

    return {
      ticker,
      // Company info
      name: s("Name"),
      description: s("Description"),
      sector: s("Sector"),
      industry: s("Industry"),
      exchange: s("Exchange"),
      currency: s("Currency") || "USD",
      country: s("Country"),
      employees: p("FullTimeEmployees"),
      website: "",  // AV doesn't provide website
      // Financials
      marketCap: p("MarketCapitalization"),
      revenue: p("RevenueTTM"),
      revenueGrowthYOY:
        p("QuarterlyRevenueGrowthYOY") != null
          ? (p("QuarterlyRevenueGrowthYOY") as number) * 100
          : null,
      ebitda: p("EBITDA"),
      netIncome: p("NetIncomeTTM") ?? null,
      profitMarginPct:
        p("ProfitMargin") != null
          ? (p("ProfitMargin") as number) * 100
          : null,
      operatingMarginPct:
        p("OperatingMarginTTM") != null
          ? (p("OperatingMarginTTM") as number) * 100
          : null,
      returnOnEquityPct:
        p("ReturnOnEquityTTM") != null
          ? (p("ReturnOnEquityTTM") as number) * 100
          : null,
      returnOnAssetsPct:
        p("ReturnOnAssetsTTM") != null
          ? (p("ReturnOnAssetsTTM") as number) * 100
          : null,
      peRatio: p("TrailingPE"),
      forwardPE: p("ForwardPE"),
      pegRatio: p("PEGRatio"),
      priceToBook: p("PriceToBookRatio"),
      eps: p("EPS"),
      bookValue: p("BookValue"),
      debtToEquity: p("DebtToEquityRatio"),
      currentRatio: p("CurrentRatio"),
      beta: p("Beta"),
      analystTargetPrice: p("AnalystTargetPrice"),
      week52High: p("52WeekHigh"),
      week52Low: p("52WeekLow"),
      dividendYield:
        p("DividendYield") != null
          ? (p("DividendYield") as number) * 100
          : null,
    };
  } catch (err) {
    console.error("[AlphaVantage] Fetch error:", err);
    return emptyData(ticker);
  }
}

function emptyData(ticker: string): AlphaVantageData {
  return {
    ticker, name: ticker, description: "", sector: "Unknown",
    industry: "Unknown", exchange: "", currency: "USD", country: "",
    employees: null, website: "",
    marketCap: null, revenue: null, revenueGrowthYOY: null, ebitda: null,
    netIncome: null, profitMarginPct: null, operatingMarginPct: null,
    returnOnEquityPct: null, returnOnAssetsPct: null, peRatio: null,
    forwardPE: null, pegRatio: null, priceToBook: null, eps: null,
    bookValue: null, debtToEquity: null, currentRatio: null, beta: null,
    analystTargetPrice: null, week52High: null, week52Low: null,
    dividendYield: null,
  };
}

/** Cached Alpha Vantage fetch — 15 minute TTL */
export const fetchAlphaVantageData = unstable_cache(
  _fetchAlphaVantageData,
  ["alpha-vantage"],
  { revalidate: 900 }
);
