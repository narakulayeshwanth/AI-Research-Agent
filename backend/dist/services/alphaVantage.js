"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAlphaVantageData = void 0;
const axios_1 = __importDefault(require("axios"));
const cache_1 = require("../lib/cache");
async function _fetchAlphaVantageData(ticker) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
        console.warn("[AlphaVantage] No API key — returning empty data.");
        return emptyData(ticker);
    }
    try {
        const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
        const { data } = await axios_1.default.get(url, { timeout: 12000 });
        if (!data?.Symbol || data.Note || data.Information) {
            console.warn("[AlphaVantage] Rate limit or no data for", ticker, data?.Note ?? data?.Information ?? "");
            return emptyData(ticker);
        }
        const p = (key) => {
            const v = parseFloat(data[key]);
            return isNaN(v) || v === 0 ? null : v;
        };
        const s = (key) => data[key] ?? "";
        return {
            ticker,
            name: s("Name"),
            description: s("Description"),
            sector: s("Sector"),
            industry: s("Industry"),
            exchange: s("Exchange"),
            currency: s("Currency") || "USD",
            country: s("Country"),
            employees: p("FullTimeEmployees"),
            website: "",
            marketCap: p("MarketCapitalization"),
            revenue: p("RevenueTTM"),
            revenueGrowthYOY: p("QuarterlyRevenueGrowthYOY") != null
                ? p("QuarterlyRevenueGrowthYOY") * 100
                : null,
            ebitda: p("EBITDA"),
            netIncome: p("NetIncomeTTM") ?? null,
            profitMarginPct: p("ProfitMargin") != null
                ? p("ProfitMargin") * 100
                : null,
            operatingMarginPct: p("OperatingMarginTTM") != null
                ? p("OperatingMarginTTM") * 100
                : null,
            returnOnEquityPct: p("ReturnOnEquityTTM") != null
                ? p("ReturnOnEquityTTM") * 100
                : null,
            returnOnAssetsPct: p("ReturnOnAssetsTTM") != null
                ? p("ReturnOnAssetsTTM") * 100
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
            dividendYield: p("DividendYield") != null
                ? p("DividendYield") * 100
                : null,
        };
    }
    catch (err) {
        console.error("[AlphaVantage] Fetch error:", err);
        return emptyData(ticker);
    }
}
function emptyData(ticker) {
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
exports.fetchAlphaVantageData = (0, cache_1.withCache)(_fetchAlphaVantageData, "alpha-vantage", 900);
//# sourceMappingURL=alphaVantage.js.map