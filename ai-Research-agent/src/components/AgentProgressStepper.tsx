"use client";

import { CheckCircle2, Circle, Loader2, Brain, BarChart3, Newspaper, AlertTriangle, TrendingUp, Award, FileText } from "lucide-react";

const AGENTS = [
  { key: "research",    label: "Company Research",   icon: Brain,          desc: "Gathering fundamentals" },
  { key: "financial",   label: "Financial Analysis",  icon: BarChart3,      desc: "Scoring metrics" },
  { key: "news",        label: "News Sentiment",       icon: Newspaper,      desc: "Analyzing news" },
  { key: "risk",        label: "Risk Assessment",      icon: AlertTriangle,  desc: "Evaluating risks" },
  { key: "bullbear",    label: "Bull vs Bear",         icon: TrendingUp,     desc: "Building arguments" },
  { key: "decision",    label: "Investment Decision",  icon: Award,          desc: "Making recommendation" },
  { key: "analystmemo", label: "Analyst Memo",         icon: FileText,       desc: "Writing report" },
];

interface Props {
  completedAgents: string[];
  currentAgent?: string;
}

export default function AgentProgressStepper({ completedAgents, currentAgent }: Props) {
  const completedSet = new Set(completedAgents);

  return (
    <div
      className="card"
      style={{ padding: "24px", marginBottom: 32 }}
      id="agent-progress-stepper"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Loader2 size={18} color="var(--accent-blue)" style={{ animation: "spin 1s linear infinite" }} />
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
          Analyzing Company
        </h3>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 13,
            color: "var(--text-secondary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {completedAgents.length} / {AGENTS.length} complete
        </span>
      </div>

      {/* Progress Track */}
      <div className="progress-track" style={{ marginBottom: 24 }}>
        <div
          className="progress-fill"
          style={{ width: `${(completedAgents.length / AGENTS.length) * 100}%` }}
        />
      </div>

      {/* Agent Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {AGENTS.map((agent, i) => {
          const Icon = agent.icon;
          const done = completedSet.has(agent.key);
          const active = currentAgent === agent.key || (
            !done &&
            completedAgents.length === i &&
            !completedSet.has(agent.key)
          );

          return (
            <div
              key={agent.key}
              id={`agent-step-${agent.key}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 14px",
                borderRadius: 10,
                background: done
                  ? "rgba(16,185,129,0.06)"
                  : active
                  ? "rgba(16,185,129,0.08)"
                  : "transparent",
                border: done
                  ? "1px solid rgba(16,185,129,0.15)"
                  : active
                  ? "1px solid rgba(16,185,129,0.2)"
                  : "1px solid transparent",
                transition: "all 0.3s ease",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done
                    ? "rgba(16,185,129,0.15)"
                    : active
                    ? "rgba(16,185,129,0.15)"
                    : "rgba(255,255,255,0.04)",
                  flexShrink: 0,
                }}
              >
                {active && !done ? (
                  <Loader2 size={16} color="var(--accent-blue)" style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Icon
                    size={16}
                    color={done ? "var(--accent-green)" : active ? "var(--accent-blue)" : "var(--text-muted)"}
                  />
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: done
                      ? "var(--text-primary)"
                      : active
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  {agent.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                  {active ? agent.desc + "..." : done ? "Completed" : "Waiting"}
                </div>
              </div>

              {/* Status Icon */}
              {done ? (
                <CheckCircle2 size={18} color="var(--accent-green)" />
              ) : active ? (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--accent-blue)",
                    fontWeight: 600,
                    background: "rgba(16,185,129,0.1)",
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  RUNNING
                </span>
              ) : (
                <Circle size={18} color="var(--text-muted)" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
