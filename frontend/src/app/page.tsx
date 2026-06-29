import type { Metadata } from "next";
import SearchForm from "@/components/SearchForm";
import { Brain, BarChart3, Newspaper, Shield, TrendingUp, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Investment Research Agent | Powered by NVIDIA NIM + LangGraph",
  description:
    "Enter any company name and get a complete AI-powered investment analysis — financial scores, news sentiment, risk assessment, and a professional INVEST/HOLD/PASS recommendation.",
};

const FEATURES = [
  {
    icon: Brain,
    title: "Company Research",
    desc: "Deep fundamentals from Yahoo Finance & Alpha Vantage",
    color: "var(--accent-blue)",
  },
  {
    icon: BarChart3,
    title: "Financial Scoring",
    desc: "Formula-based scores for growth, profitability & valuation",
    color: "var(--accent-cyan)",
  },
  {
    icon: Newspaper,
    title: "News Sentiment",
    desc: "Real-time news analysis with positive/negative classification",
    color: "var(--accent-purple)",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    desc: "5-dimension risk matrix: industry, competition & regulatory",
    color: "var(--accent-amber)",
  },
  {
    icon: TrendingUp,
    title: "Bull vs Bear",
    desc: "Evidence-backed arguments for both sides",
    color: "var(--accent-green)",
  },
  {
    icon: FileText,
    title: "Analyst Memo",
    desc: "Professional equity research report, export as PDF",
    color: "var(--accent-red)",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
      }}
    >
      {/* Hero */}
      <div
        className="animate-fade-in-up"
        style={{ textAlign: "center", maxWidth: 720, marginBottom: 48 }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--accent-blue)",
            marginBottom: 24,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent-green)",
              animation: "pulse-glow 2s infinite",
            }}
          />
          AI-Powered · Multi-Agent · Real-Time Research
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 60px)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: "-0.03em",
          }}
        >
          AI Investment{" "}
          <span className="text-gradient">Research Agent</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            marginBottom: 40,
            maxWidth: 580,
            margin: "0 auto 40px",
          }}
        >
          Enter any company name. Our 7-agent AI workflow researches financials,
          news sentiment, and risks — then delivers a professional{" "}
          <strong style={{ color: "var(--accent-green)" }}>INVEST</strong>,{" "}
          <strong style={{ color: "var(--accent-amber)" }}>HOLD</strong>, or{" "}
          <strong style={{ color: "var(--accent-red)" }}>PASS</strong> recommendation
          with full reasoning.
        </p>

        {/* Search Form */}
        <SearchForm />
      </div>

      {/* Divider */}
      <div className="divider" style={{ width: "100%", maxWidth: 700, marginBottom: 40 }} />

      {/* Feature Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          maxWidth: 900,
          width: "100%",
        }}
      >
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className={`card animate-fade-in-up delay-${(i + 1) * 100}`}
              id={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ padding: "18px 16px" }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Icon size={18} color={f.color} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 64,
          fontSize: 12,
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        <span style={{ opacity: 0.5 }}>
          For educational and informational purposes only. Not financial advice.
        </span>
      </div>
    </main>
  );
}
