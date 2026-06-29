"use client";

import type { FinancialAnalysis } from "@/types/investment";
import { scoreToColor } from "@/lib/scoring";
import SourcesFooter from "./SourcesFooter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  analysis: FinancialAnalysis;
}

const SCORE_CONFIG = [
  { key: "growthScore",           label: "Growth",    reasonKey: "growthReasoning",            weight: "30%" },
  { key: "profitabilityScore",    label: "Profit",    reasonKey: "profitabilityReasoning",      weight: "25%" },
  { key: "valuationScore",        label: "Valuation", reasonKey: "valuationReasoning",          weight: "20%" },
  { key: "financialStrengthScore",label: "Strength",  reasonKey: "financialStrengthReasoning",  weight: "25%" },
] as const;

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  const pct = (score / 10) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,0.05) ${pct}%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color,
          }}
        >
          {score}
        </div>
      </div>
    </div>
  );
}

const CHART_COLORS = {
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
};

export default function FinancialScoreCard({ analysis }: Props) {
  const chartData = SCORE_CONFIG.map((cfg) => ({
    name: cfg.label,
    score: analysis[cfg.key],
    color: CHART_COLORS[scoreToColor(analysis[cfg.key])],
  }));

  return (
    <div className="card animate-fade-in-up" id="financial-score-card" style={{ padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Financial Analysis</h3>
        {/* Overall Score */}
        <div
          style={{
            textAlign: "center",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 12,
            padding: "10px 18px",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Overall Score
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color:
                analysis.overallScore >= 7
                  ? "var(--accent-green)"
                  : analysis.overallScore >= 4
                  ? "var(--accent-amber)"
                  : "var(--accent-red)",
            }}
          >
            {analysis.overallScore}
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 400 }}>/10</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Weighted composite</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ height: 180, marginBottom: 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={36} id="financial-score-chart">
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 10]} hide />
            <Tooltip
              contentStyle={{
                background: "#0d1117",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
              formatter={(v) => [`${v}/10`, "Score"]}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Cards with Reasoning */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {SCORE_CONFIG.map((cfg) => {
          const score = analysis[cfg.key];
          const color = scoreToColor(score);
          const colorMap = { green: "var(--accent-green)", yellow: "var(--accent-amber)", red: "var(--accent-red)" };
          return (
            <div
              key={cfg.key}
              id={`score-${cfg.key}`}
              style={{
                display: "flex",
                gap: 16,
                padding: "14px 16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                alignItems: "flex-start",
              }}
            >
              <ScoreGauge score={score} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{cfg.label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: colorMap[color],
                      background: `${colorMap[color]}18`,
                      padding: "1px 8px",
                      borderRadius: 999,
                      fontWeight: 600,
                    }}
                  >
                    {score}/10
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                    Weight: {cfg.weight}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {analysis[cfg.reasonKey]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Summary */}
      <div
        style={{
          padding: 16,
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.15)",
          borderRadius: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Summary
        </div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          {analysis.overallSummary}
        </p>
      </div>

      {/* Key Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {analysis.keyMetrics.map((m) => (
          <div
            key={m.label}
            style={{
              padding: "8px 12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{m.value}</div>
          </div>
        ))}
      </div>

      <SourcesFooter sources={analysis.sources} />
    </div>
  );
}
