"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewsArticles = void 0;
const axios_1 = __importDefault(require("axios"));
const cache_1 = require("../lib/cache");
async function _fetchNewsArticles(companyName, ticker) {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        console.warn("[NewsAPI] No API key — returning empty articles.");
        return [];
    }
    try {
        const query = encodeURIComponent(`${companyName} OR ${ticker} stock`);
        const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${apiKey}`;
        const { data } = await axios_1.default.get(url, { timeout: 8000 });
        if (!data?.articles)
            return [];
        return data.articles
            .filter((a) => a.title && a.title !== "[Removed]")
            .slice(0, 10)
            .map((a) => ({
            title: a.title ?? "",
            description: a.description ?? a.content?.slice(0, 200) ?? "",
            url: a.url ?? "",
            publishedAt: a.publishedAt ?? new Date().toISOString(),
            source: a.source?.name ?? "Unknown",
        }));
    }
    catch (err) {
        console.error("[NewsAPI] Fetch error:", err);
        return [];
    }
}
/** Cached News fetch — 15 minute TTL */
exports.fetchNewsArticles = (0, cache_1.withCache)(_fetchNewsArticles, "news-api", 900);
//# sourceMappingURL=newsApi.js.map