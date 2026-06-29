"use client";

import { Building2, Globe, Users, TrendingUp, Award, MapPin, ExternalLink } from "lucide-react";
import type { CompanyProfile } from "@/types/investment";
import SourcesFooter from "./SourcesFooter";

interface Props {
  profile: CompanyProfile;
}

export default function CompanyOverviewCard({ profile }: Props) {
  return (
    <div className="card animate-fade-in-up" id="company-overview-card" style={{ padding: 28 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
              {profile.name}
            </h2>
            <span className="badge badge-blue font-mono">{profile.ticker}</span>
            <span className="badge badge-purple">{profile.exchange}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            <Building2 size={13} />
            <span>{profile.sector}</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span>{profile.industry}</span>
          </div>
        </div>

        {/* Market Cap Badge */}
        <div
          style={{
            textAlign: "right",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 12,
            padding: "12px 18px",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Market Cap
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-blue)" }}>
            {profile.marketCapFormatted}
          </div>
        </div>
      </div>

      {/* Description */}
      {profile.description && (
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          {profile.description.length > 400
            ? profile.description.slice(0, 400) + "..."
            : profile.description}
        </p>
      )}

      {/* Key Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Revenue", value: profile.revenueFormatted, icon: TrendingUp },
          { label: "Net Income", value: profile.netIncomeFormatted, icon: Award },
          {
            label: "Revenue Growth",
            value: profile.revenueGrowthPct != null ? `${profile.revenueGrowthPct.toFixed(1)}%` : "N/A",
            icon: TrendingUp,
            color:
              (profile.revenueGrowthPct ?? 0) > 10
                ? "var(--accent-green)"
                : (profile.revenueGrowthPct ?? 0) > 0
                ? "var(--accent-amber)"
                : "var(--accent-red)",
          },
          {
            label: "Net Margin",
            value: profile.profitMarginPct != null ? `${profile.profitMarginPct.toFixed(1)}%` : "N/A",
            icon: Award,
          },
          {
            label: "P/E Ratio",
            value: profile.peRatio != null ? `${profile.peRatio.toFixed(1)}x` : "N/A",
            icon: Award,
          },
          {
            label: "Employees",
            value: profile.employees != null ? profile.employees.toLocaleString() : "N/A",
            icon: Users,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon size={11} />
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: item.color ?? "var(--text-primary)",
                }}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Competitors */}
      {profile.competitors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Key Competitors
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {profile.competitors.map((c) => (
              <span key={c} className="badge badge-cyan">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Location & Website */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {profile.headquarters && (
          <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={13} />
            {profile.headquarters}
          </span>
        )}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              color: "var(--accent-blue)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              textDecoration: "none",
            }}
            id="company-website-link"
          >
            <Globe size={13} />
            Website
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      <SourcesFooter sources={profile.sources} />
    </div>
  );
}
