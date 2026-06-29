"use client";

import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import type { NewsAnalysis } from "@/types/investment";
import SourcesFooter from "./SourcesFooter";

interface Props { analysis: NewsAnalysis }

function SentimentIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive") return <TrendingUp size={12} color="var(--accent-green)" />;
  if (sentiment === "negative") return <TrendingDown size={12} color="var(--accent-red)" />;
  return <Minus size={12} color="var(--text-muted)" />;
}

export default function NewsSummaryCard({ analysis }: Props) {
  const sentimentColor =
    analysis.overallSentiment === "bullish" ? "var(--accent-green)"
    : analysis.overallSentiment === "bearish" ? "var(--accent-red)"
    : "var(--accent-amber)";

  const sentimentBadge =
    analysis.overallSentiment === "bullish" ? "badge-green"
    : analysis.overallSentiment === "bearish" ? "badge-red"
    : "badge-amber";

  return (
    <div className="card animate-fade-in-up" id="news-summary-card" style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>News & Sentiment</h3>
        <span className={`badge ${sentimentBadge}`} style={{ textTransform: "capitalize" }}>
          {analysis.overallSentiment}
        </span>
      </div>

      {/* Sentiment Scores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: 10,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--accent-green)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Positive Score
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent-green)" }}>
            {analysis.positiveSentimentScore}
            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
          </div>
        </div>
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: 10,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--accent-red)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Negative Score
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent-red)" }}>
            {analysis.negativeSentimentScore}
            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
          </div>
        </div>
      </div>

      {/* Sentiment Summary */}
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
        {analysis.sentimentSummary}
      </p>

      {/* Positive & Negative Items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-green)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            ↑ Positive Developments
          </div>
          {analysis.positiveItems.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.positiveItems.map((item, i) => (
                <div
                  key={i}
                  id={`positive-item-${i}`}
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    padding: "8px 12px",
                    background: "rgba(16,185,129,0.05)",
                    border: "1px solid rgba(16,185,129,0.12)",
                    borderRadius: 8,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <TrendingUp size={12} color="var(--accent-green)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No positive developments identified.</p>
          )}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-red)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            ↓ Negative Developments
          </div>
          {analysis.negativeItems.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.negativeItems.map((item, i) => (
                <div
                  key={i}
                  id={`negative-item-${i}`}
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    padding: "8px 12px",
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.12)",
                    borderRadius: 8,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <TrendingDown size={12} color="var(--accent-red)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No negative developments identified.</p>
          )}
        </div>
      </div>

      {/* Recent Articles */}
      {analysis.articles.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            Recent Articles ({analysis.articles.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {analysis.articles.slice(0, 6).map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                id={`news-article-${i}`}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <SentimentIcon sentiment={article.sentiment} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      fontWeight: 500,
                      marginBottom: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {article.title}
                  </div>
                  {article.summary && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {article.summary.slice(0, 100)}
                    </div>
                  )}
                </div>
                <ExternalLink size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      <SourcesFooter sources={analysis.sources} />
    </div>
  );
}
