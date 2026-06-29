"use client";

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  error: string;
  company?: string;
}

export default function ErrorState({ error, company }: Props) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "48px 24px",
        textAlign: "center",
      }}
      id="error-state"
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <AlertCircle size={32} color="var(--accent-red)" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Analysis Failed</h2>
      <p
        style={{
          fontSize: 15,
          color: "var(--text-secondary)",
          maxWidth: 480,
          lineHeight: 1.7,
          marginBottom: 28,
        }}
      >
        {error}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {company && (
          <button
            id="retry-button"
            className="btn-primary"
            onClick={() => window.location.reload()}
            style={{ gap: 8 }}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        )}
        <button
          id="home-button"
          className="btn-secondary"
          onClick={() => router.push("/")}
          style={{ gap: 8 }}
        >
          <Home size={15} />
          New Search
        </button>
      </div>
    </div>
  );
}
