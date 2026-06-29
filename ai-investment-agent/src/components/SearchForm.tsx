"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Loader2, Sparkles } from "lucide-react";

const EXAMPLE_COMPANIES = ["NVIDIA", "Tesla", "Apple", "Microsoft", "Amazon"];

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    router.push(`/results/${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}
      id="search-form"
    >
      {/* Search Input Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            id="company-search-input"
            className="input-field"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name or ticker (e.g. NVIDIA, TSLA)"
            style={{ paddingLeft: 48 }}
            autoComplete="off"
            disabled={loading}
          />
        </div>
        <button
          id="analyze-button"
          type="submit"
          className="btn-primary"
          disabled={!query.trim() || loading}
          style={{ minWidth: 140, flexShrink: 0 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp size={16} />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Example Companies */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}
        >
          <Sparkles size={12} /> Try:
        </span>
        {EXAMPLE_COMPANIES.map((company) => (
          <button
            key={company}
            type="button"
            id={`example-${company.toLowerCase()}`}
            onClick={() => {
              setQuery(company);
            }}
            style={{
              padding: "4px 14px",
              borderRadius: 999,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "var(--accent-blue)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(16,185,129,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(16,185,129,0.08)";
            }}
          >
            {company}
          </button>
        ))}
      </div>
    </form>
  );
}
