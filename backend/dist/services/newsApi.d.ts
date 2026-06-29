export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: string;
}
/** Cached News fetch — 15 minute TTL */
export declare const fetchNewsArticles: (companyName: string, ticker: string) => Promise<NewsArticle[]>;
//# sourceMappingURL=newsApi.d.ts.map