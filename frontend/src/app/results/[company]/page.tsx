"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import type { ResearchState } from "@/types/investment";

import AgentProgressStepper from "@/components/AgentProgressStepper";
import CompanyOverviewCard from "@/components/CompanyOverviewCard";
import FinancialScoreCard from "@/components/FinancialScoreCard";
import NewsSummaryCard from "@/components/NewsSummaryCard";
import RiskCard from "@/components/RiskCard";
import BullBearCard from "@/components/BullBearCard";
import RecommendationCard from "@/components/RecommendationCard";
import AnalystMemoCard from "@/components/AnalystMemoCard";
import ExportButton from "@/components/ExportButton";
import ErrorState from "@/components/ErrorState";

const TABS = [
  { id: "overview",    label: "Overview" },
  { id: "financial",   label: "Financials" },
  { id: "news",        label: "News" },
  { id: "risk",        label: "Risk" },
  { id: "bullbear",    label: "Bull / Bear" },
  { id: "decision",    label: "Decision" },
  { id: "memo",        label: "Analyst Memo" },
];

interface PageProps {
  params: Promise<{ company: string }>;
}

export default function ResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [state, setState] = useState<Partial<ResearchState>>({ completedAgents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentAgent, setCurrentAgent] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    params.then((p) => {
      const name = decodeURIComponent(p.company);
      setCompany(name);
      startAnalysis(name);
    });
    return () => abortRef.current?.abort();
  }, []);

  const startAnalysis = async (companyName: string) => {
    setLoading(true);
    setError(null);
    setState({ completedAgents: [] });

    abortRef.current = new AbortController();

    try {
      // Use the Render backend URL — falls back to localhost:3001 for local dev
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error ?? "Analysis request failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const eventBlock of events) {
          const lines = eventBlock.trim().split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine  = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const eventType = eventLine.replace("event:", "").trim();
          const data = JSON.parse(dataLine.replace("data:", "").trim());

          if (eventType === "agent_complete") {
            setCurrentAgent(data.agent);
            setState((prev) => ({
              ...prev,
              ...data.data,
              completedAgents: data.completedAgents ?? prev.completedAgents ?? [],
            }));
          } else if (eventType === "complete") {
            setCurrentAgent(undefined);
            setState(data.data);
            setLoading(false);
          } else if (eventType === "error") {
            throw new Error(data.error ?? "Unknown error occurred.");
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      setError((err as Error)?.message ?? "Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  const isComplete = !loading && !error;
  const hasProfile = !!state.companyProfile;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
      {/* Top Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            id="back-button"
            className="btn-secondary"
            onClick={() => router.back()}
            style={{ gap: 6, fontSize: 13 }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <button
            id="home-nav-button"
            className="btn-secondary"
            onClick={() => router.push("/")}
            style={{ gap: 6, fontSize: 13 }}
          >
            <Home size={14} />
            New Search
          </button>
        </div>

        {isComplete && state.companyProfile && (
          <ExportButton data={state as ResearchState} />
        )}
      </div>

      {/* Company Header (shown as soon as research agent finishes) */}
      {hasProfile && state.companyProfile && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{state.companyProfile.name}</h1>
            <span
              className="badge badge-blue font-mono"
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              {state.companyProfile.ticker}
            </span>
            {state.investmentDecision && (
              <span
                className={`badge ${
                  state.investmentDecision.recommendation === "INVEST"
                    ? "badge-green"
                    : state.investmentDecision.recommendation === "HOLD"
                    ? "badge-amber"
                    : "badge-red"
                }`}
                style={{ fontSize: 14, padding: "4px 12px", fontWeight: 700 }}
                id="top-recommendation-badge"
              >
                {state.investmentDecision.recommendation} · {state.investmentDecision.confidence}%
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            {state.companyProfile.sector} · {state.companyProfile.industry}
          </p>
        </div>
      )}

      {/* Loading Progress */}
      {loading && (
        <AgentProgressStepper
          completedAgents={state.completedAgents ?? []}
          currentAgent={currentAgent}
        />
      )}

      {/* Error */}
      {error && <ErrorState error={error} company={company} />}

      {/* Results — show incrementally as agents complete */}
      {hasProfile && !error && (
        <>
          {/* Tab Navigation */}
          {isComplete && (
            <div className="tab-nav" style={{ marginBottom: 24 }} id="results-tabs">
              {TABS.filter((t) => {
                if (t.id === "overview" && !state.companyProfile) return false;
                if (t.id === "financial" && !state.financialAnalysis) return false;
                if (t.id === "news" && !state.newsAnalysis) return false;
                if (t.id === "risk" && !state.riskAnalysis) return false;
                if (t.id === "bullbear" && !state.bullBearAnalysis) return false;
                if (t.id === "decision" && !state.investmentDecision) return false;
                if (t.id === "memo" && !state.analystMemo) return false;
                return true;
              }).map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* In loading mode: show all cards as they arrive; in complete mode: show only active tab */}
            {(loading || activeTab === "overview") && state.companyProfile && (
              <CompanyOverviewCard profile={state.companyProfile} />
            )}
            {(loading || activeTab === "financial") && state.financialAnalysis && (
              <FinancialScoreCard analysis={state.financialAnalysis} />
            )}
            {(loading || activeTab === "news") && state.newsAnalysis && (
              <NewsSummaryCard analysis={state.newsAnalysis} />
            )}
            {(loading || activeTab === "risk") && state.riskAnalysis && (
              <RiskCard analysis={state.riskAnalysis} />
            )}
            {(loading || activeTab === "bullbear") && state.bullBearAnalysis && (
              <BullBearCard analysis={state.bullBearAnalysis} />
            )}
            {(loading || activeTab === "decision") && state.investmentDecision && (
              <RecommendationCard decision={state.investmentDecision} />
            )}
            {(loading || activeTab === "memo") && state.analystMemo && state.companyProfile && state.investmentDecision && (
              <AnalystMemoCard
                memo={state.analystMemo}
                companyName={state.companyProfile.name}
                ticker={state.companyProfile.ticker}
                recommendation={state.investmentDecision.recommendation}
              />
            )}
          </div>
        </>
      )}

      {/* Disclaimer */}
      {isComplete && (
        <p
          style={{
            marginTop: 40,
            fontSize: 11,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          ⚠️ This analysis is generated by AI for informational purposes only. Not financial advice.
          Always conduct your own due diligence before making investment decisions.
        </p>
      )}
    </div>
  );
}
