"use client";

import type { AnalystMemo } from "@/types/investment";
import SourcesFooter from "./SourcesFooter";
import { FileText, Calendar } from "lucide-react";

interface Props {
  memo: AnalystMemo;
  companyName: string;
  ticker: string;
  recommendation: string;
}

const SECTIONS = [
  { key: "executiveSummary",       label: "Executive Summary",       accent: "var(--accent-blue)" },
  { key: "investmentThesis",       label: "Investment Thesis",       accent: "var(--accent-purple)" },
  { key: "financialHealth",        label: "Financial Health",        accent: "var(--accent-cyan)" },
  { key: "riskAssessment",         label: "Risk Assessment",         accent: "var(--accent-amber)" },
  { key: "investmentRecommendation", label: "Investment Recommendation", accent: "var(--accent-green)" },
  { key: "conclusion",             label: "Conclusion",              accent: "var(--accent-blue)" },
] as const;

export default function AnalystMemoCard({ memo, companyName, ticker, recommendation }: Props) {
  const recColor =
    recommendation === "INVEST" ? "var(--accent-green)"
    : recommendation === "PASS" ? "var(--accent-red)"
    : "var(--accent-amber)";

  return (
    <div className="card animate-fade-in-up" id="analyst-memo-card" style={{ padding: 28 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.2))",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={20} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Equity Research Memo
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
              {companyName} ({ticker})
            </h3>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: recColor,
              background: `${recColor}18`,
              border: `1px solid ${recColor}30`,
              padding: "4px 14px",
              borderRadius: 999,
              marginBottom: 6,
            }}
          >
            {recommendation}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              justifyContent: "flex-end",
            }}
          >
            <Calendar size={12} />
            {memo.dateGenerated}
          </div>
        </div>
      </div>

      {/* Memo Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SECTIONS.map((section) => (
          <div key={section.key} id={`memo-section-${section.key}`}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 16,
                  borderRadius: 2,
                  background: section.accent,
                }}
              />
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: section.accent,
                }}
              >
                {section.label}
              </h4>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                paddingLeft: 11,
              }}
            >
              {memo[section.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Analyst Note */}
      <div
        style={{
          marginTop: 24,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
          {memo.analystNote}
        </div>
      </div>

      <SourcesFooter sources={memo.sources} />
    </div>
  );
}
