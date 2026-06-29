"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import type { RiskAnalysis } from "@/types/investment";
import SourcesFooter from "./SourcesFooter";

interface Props { analysis: RiskAnalysis }

const RISK_KEYS = [
  { key: "industryRisk",     label: "Industry Risk" },
  { key: "competitionRisk",  label: "Competition Risk" },
  { key: "regulatoryRisk",   label: "Regulatory Risk" },
  { key: "marketRisk",       label: "Market Risk" },
  { key: "valuationRisk",    label: "Valuation Risk" },
] as const;

function riskBadgeClass(level: string): string {
  if (level === "Low")    return "badge-green";
  if (level === "High")   return "badge-red";
  return "badge-amber";
}

function riskColor(level: string): string {
  if (level === "Low")    return "var(--accent-green)";
  if (level === "High")   return "var(--accent-red)";
  return "var(--accent-amber)";
}

export default function RiskCard({ analysis }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card animate-fade-in-up" id="risk-card" style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Risk Assessment</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color={riskColor(analysis.overallRiskLevel)} />
          <span className={`badge ${riskBadgeClass(analysis.overallRiskLevel)}`}>
            Overall: {analysis.overallRiskLevel} Risk
          </span>
        </div>
      </div>

      {/* Overall Summary */}
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
        {analysis.overallRiskSummary}
      </p>

      {/* Risk Matrix */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {RISK_KEYS.map(({ key, label }) => {
          const risk = analysis[key];
          const isOpen = expanded === key;

          return (
            <div
              key={key}
              id={`risk-item-${key}`}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
                }}
                aria-expanded={isOpen}
                id={`risk-toggle-${key}`}
              >
                {/* Level indicator bar */}
                <div
                  style={{
                    width: 4,
                    height: 36,
                    borderRadius: 2,
                    background: riskColor(risk.level),
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {isOpen ? "Click to collapse" : "Click to expand"}
                  </div>
                </div>

                <span className={`badge ${riskBadgeClass(risk.level)}`}>{risk.level}</span>
                {isOpen ? (
                  <ChevronUp size={16} color="var(--text-muted)" />
                ) : (
                  <ChevronDown size={16} color="var(--text-muted)" />
                )}
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 16px 16px 16px",
                    background: "rgba(255,255,255,0.01)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      marginTop: 14,
                      marginBottom: 10,
                    }}
                  >
                    {risk.description}
                  </p>
                  {risk.mitigants && (
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.12)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "var(--accent-green)",
                      }}
                    >
                      <strong>Mitigant:</strong>{" "}
                      <span style={{ color: "var(--text-secondary)" }}>{risk.mitigants}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SourcesFooter sources={analysis.sources} />
    </div>
  );
}
