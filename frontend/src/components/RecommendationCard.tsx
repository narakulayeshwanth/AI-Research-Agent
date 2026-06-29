"use client";

import type { InvestmentDecision } from "@/types/investment";
import SourcesFooter from "./SourcesFooter";
import { CheckCircle2, XCircle, MinusCircle, Clock, AlertTriangle } from "lucide-react";

interface Props { decision: InvestmentDecision }

export default function RecommendationCard({ decision }: Props) {
  const isInvest = decision.recommendation === "INVEST";
  const isHold   = decision.recommendation === "HOLD";
  const isPass   = decision.recommendation === "PASS";

  const recClass   = isInvest ? "rec-invest" : isHold ? "rec-hold" : "rec-pass";
  const recColor   = isInvest ? "var(--accent-green)" : isHold ? "var(--accent-amber)" : "var(--accent-red)";
  const RecIcon    = isInvest ? CheckCircle2 : isHold ? MinusCircle : XCircle;

  // Confidence arc (SVG)
  const RADIUS = 54;
  const STROKE = 10;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE - (decision.confidence / 100) * CIRCUMFERENCE;

  // Split keyFactors into regular + whyNot (prefixed with ⚠️)
  const whyNotFactors = decision.keyFactors.filter(f => f.startsWith("⚠️"));
  const mainFactors   = decision.keyFactors.filter(f => !f.startsWith("⚠️"));

  return (
    <div className="card animate-fade-in-up" id="recommendation-card" style={{ padding: 28 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Investment Decision</h3>

      {/* Main Recommendation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        {/* Recommendation Badge */}
        <div
          className={recClass}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 28px",
            borderRadius: 16,
          }}
          id="recommendation-badge"
        >
          <RecIcon size={28} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, marginBottom: 2 }}>
              Recommendation
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em" }}>
              {decision.recommendation}
            </div>
          </div>
        </div>

        {/* Confidence Arc */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <svg width={128} height={128} viewBox="0 0 128 128" id="confidence-gauge">
            {/* Track */}
            <circle
              cx={64} cy={64} r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            {/* Fill */}
            <circle
              cx={64} cy={64} r={RADIUS}
              fill="none"
              stroke={recColor}
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
            {/* Text */}
            <text
              x={64} y={60}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize={22}
              fontWeight={800}
              fontFamily="Inter, sans-serif"
            >
              {decision.confidence}%
            </text>
            <text
              x={64} y={78}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize={11}
              fontFamily="Inter, sans-serif"
            >
              confidence
            </text>
          </svg>
        </div>
      </div>

      {/* Time Horizon */}
      {decision.timeHorizon && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 999,
            fontSize: 13,
            color: "var(--accent-purple)",
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          <Clock size={13} />
          Time Horizon: {decision.timeHorizon}
        </div>
      )}

      {/* Reasoning */}
      <div
        style={{
          padding: 18,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          Reasoning
        </div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>
          {decision.reasoning}
        </p>
      </div>

      {/* Key Factors */}
      {mainFactors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Key Factors
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mainFactors.map((factor, i) => (
              <div
                key={i}
                id={`key-factor-${i}`}
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  padding: "8px 12px",
                  background: `${recColor}0d`,
                  border: `1px solid ${recColor}20`,
                  borderRadius: 8,
                  alignItems: "flex-start",
                }}
              >
                <RecIcon size={13} color={recColor} style={{ marginTop: 2, flexShrink: 0 }} />
                {factor}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why Not? Section */}
      {whyNotFactors.length > 0 && (
        <div
          style={{
            padding: 16,
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 12,
            marginBottom: 16,
          }}
          id="why-not-section"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--accent-amber)",
              marginBottom: 10,
            }}
          >
            <AlertTriangle size={13} /> Why Not?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {whyNotFactors.map((factor, i) => (
              <div
                key={i}
                id={`why-not-${i}`}
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle size={12} color="var(--accent-amber)" style={{ marginTop: 2, flexShrink: 0 }} />
                {factor.replace("⚠️ Risk: ", "")}
              </div>
            ))}
          </div>
        </div>
      )}

      <SourcesFooter sources={decision.sources} />
    </div>
  );
}
