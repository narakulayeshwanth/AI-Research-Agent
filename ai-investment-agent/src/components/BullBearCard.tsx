"use client";

import type { BullBearAnalysis } from "@/types/investment";
import SourcesFooter from "./SourcesFooter";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props { analysis: BullBearAnalysis }

export default function BullBearCard({ analysis }: Props) {
  return (
    <div className="card animate-fade-in-up" id="bull-bear-card" style={{ padding: 28 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Bull vs Bear Case</h3>

      {/* Strength Meter */}
      <div
        style={{
          marginBottom: 24,
          padding: "14px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-green)" }}>
            🐂 Bull Strength: {analysis.bullStrength}/10
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-red)" }}>
            🐻 Bear Strength: {analysis.bearStrength}/10
          </span>
        </div>
        {/* Combined bar */}
        <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden", display: "flex" }}>
          <div
            style={{
              width: `${(analysis.bullStrength / (analysis.bullStrength + analysis.bearStrength)) * 100}%`,
              background: "linear-gradient(90deg, #10b981, #06b6d4)",
              borderRadius: "999px 0 0 999px",
              transition: "width 0.5s ease",
            }}
          />
          <div
            style={{
              flex: 1,
              background: "linear-gradient(90deg, #ef4444, #f97316)",
              borderRadius: "0 999px 999px 0",
            }}
          />
        </div>
      </div>

      {/* Two-column arguments */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Bull Column */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--accent-green)",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrendingUp size={14} /> WHY INVEST
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analysis.bullArguments.map((arg, i) => (
              <div
                key={i}
                id={`bull-argument-${i}`}
                style={{
                  padding: "12px 14px",
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {arg.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {arg.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bear Column */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--accent-red)",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrendingDown size={14} /> WHY AVOID
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analysis.bearArguments.map((arg, i) => (
              <div
                key={i}
                id={`bear-argument-${i}`}
                style={{
                  padding: "12px 14px",
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {arg.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {arg.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SourcesFooter sources={analysis.sources} />
    </div>
  );
}
