"use client";

import { Database } from "lucide-react";

interface Props {
  sources: string[];
}

export default function SourcesFooter({ sources }: Props) {
  if (!sources || sources.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 20,
        paddingTop: 14,
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Database size={11} color="var(--text-muted)" />
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Sources:</span>
      {sources.map((src) => (
        <span
          key={src}
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {src}
        </span>
      ))}
    </div>
  );
}
