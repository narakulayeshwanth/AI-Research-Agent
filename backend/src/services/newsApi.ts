import axios from "axios";
import { withCache } from "../lib/cache";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

async function _fetchNewsArticles(
  companyName: string,
  ticker: string
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn("[NewsAPI] No API key — returning empty articles.");
    return [];
  }

  try {
    const query = encodeURIComponent(`${companyName} OR ${ticker} stock`);
    const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${apiKey}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    if (!data?.articles) return [];

    return (data.articles as any[])
      .filter((a) => a.title && a.title !== "[Removed]")
      .slice(0, 10)
      .map((a) => ({
        title: a.title ?? "",
        description: a.description ?? a.content?.slice(0, 200) ?? "",
        url: a.url ?? "",
        publishedAt: a.publishedAt ?? new Date().toISOString(),
        source: a.source?.name ?? "Unknown",
      }));
  } catch (err) {
    console.error("[NewsAPI] Fetch error:", err);
    return [];
  }
}

/** Cached News fetch — 15 minute TTL */
export const fetchNewsArticles = withCache(
  _fetchNewsArticles,
  "news-api",
  900
);
