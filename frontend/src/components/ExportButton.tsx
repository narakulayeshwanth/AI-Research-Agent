"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { ResearchState } from "@/types/investment";

interface Props {
  data: ResearchState;
}

export default function ExportButton({ data }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      // @ts-ignore
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const p = data.companyProfile!;
      const f = data.financialAnalysis!;
      const d = data.investmentDecision!;
      const m = data.analystMemo!;

      const margin = 18;
      let y = 18;

      // Header
      doc.setFillColor(8, 11, 20);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("AI INVESTMENT RESEARCH AGENT", margin, 14);
      doc.setTextColor(240, 246, 252);
      doc.setFontSize(18);
      doc.text(`${p.name} (${p.ticker})`, margin, 26);
      doc.setFontSize(10);
      doc.setTextColor(139, 148, 158);
      doc.text(`${p.sector} · ${p.industry} · Generated ${m?.dateGenerated ?? new Date().toLocaleDateString()}`, margin, 34);
      y = 50;

      // Recommendation
      const recColors: Record<string, [number, number, number]> = {
        INVEST: [16, 185, 129],
        HOLD: [245, 158, 11],
        PASS: [239, 68, 68],
      };
      const [r, g, b] = recColors[d.recommendation] ?? [99, 102, 241];
      doc.setFillColor(r, g, b);
      doc.roundedRect(margin, y, 60, 20, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(d.recommendation, margin + 30, y + 13, { align: "center" });

      doc.setTextColor(240, 246, 252);
      doc.setFontSize(11);
      doc.text(`Confidence: ${d.confidence}%`, margin + 70, y + 9);
      doc.setFontSize(9);
      doc.setTextColor(139, 148, 158);
      doc.text(`Time Horizon: ${d.timeHorizon ?? "N/A"}`, margin + 70, y + 16);
      y += 28;

      // Section helper
      const section = (title: string) => {
        y += 4;
        doc.setFillColor(30, 40, 60);
        doc.rect(margin, y, 174, 8, "F");
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin + 3, y + 5.5);
        y += 12;
      };

      const body = (text: string, indent = 0) => {
        doc.setTextColor(180, 190, 210);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, 174 - indent);
        doc.text(lines, margin + indent, y);
        y += lines.length * 5 + 2;
      };

      // Company Overview
      section("Company Overview");
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Metric", "Value", "Metric", "Value"]],
        body: [
          ["Market Cap", p.marketCapFormatted, "Revenue", p.revenueFormatted],
          ["Revenue Growth", p.revenueGrowthPct != null ? `${p.revenueGrowthPct.toFixed(1)}%` : "N/A", "Net Margin", p.profitMarginPct != null ? `${p.profitMarginPct.toFixed(1)}%` : "N/A"],
          ["P/E Ratio", p.peRatio != null ? `${p.peRatio.toFixed(1)}x` : "N/A", "D/E Ratio", p.debtToEquity != null ? p.debtToEquity.toFixed(2) : "N/A"],
          ["Employees", p.employees?.toLocaleString() ?? "N/A", "Exchange", p.exchange],
        ],
        styles: { fontSize: 8, cellPadding: 3, textColor: [180, 190, 210], fillColor: [13, 17, 27] },
        headStyles: { fillColor: [20, 30, 50], textColor: [59, 130, 246], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [16, 22, 35] },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      // Financial Scores
      section("Financial Analysis");
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Dimension", "Score", "Weight", "Reasoning"]],
        body: [
          ["Growth", `${f.growthScore}/10`, "30%", f.growthReasoning.slice(0, 80)],
          ["Profitability", `${f.profitabilityScore}/10`, "25%", f.profitabilityReasoning.slice(0, 80)],
          ["Valuation", `${f.valuationScore}/10`, "20%", f.valuationReasoning.slice(0, 80)],
          ["Fin. Strength", `${f.financialStrengthScore}/10`, "25%", f.financialStrengthReasoning.slice(0, 80)],
          ["Overall Score", `${f.overallScore}/10`, "Weighted", f.overallSummary.slice(0, 80)],
        ],
        styles: { fontSize: 7, cellPadding: 2.5, textColor: [180, 190, 210], fillColor: [13, 17, 27] },
        headStyles: { fillColor: [20, 30, 50], textColor: [59, 130, 246], fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 15 }, 2: { cellWidth: 15 }, 3: { cellWidth: 119 } },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      // Add new page if needed
      if (y > 250) { doc.addPage(); y = 18; }

      // Analyst Memo Sections
      section("Analyst Research Memo");
      const memoSections = [
        { label: "Executive Summary", text: m.executiveSummary },
        { label: "Investment Thesis", text: m.investmentThesis },
        { label: "Financial Health", text: m.financialHealth },
        { label: "Risk Assessment", text: m.riskAssessment },
        { label: "Recommendation", text: m.investmentRecommendation },
        { label: "Conclusion", text: m.conclusion },
      ];

      for (const s of memoSections) {
        if (y > 260) { doc.addPage(); y = 18; }
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(s.label.toUpperCase(), margin, y);
        y += 5;
        body(s.text, 2);
      }

      // Reasoning
      if (y > 240) { doc.addPage(); y = 18; }
      section("Investment Decision Reasoning");
      body(d.reasoning);

      // Disclaimer
      doc.setFontSize(7);
      doc.setTextColor(100, 110, 130);
      doc.text("Disclaimer: This report is generated by AI and is for informational purposes only. Not financial advice.", margin, 287);

      doc.save(`${p.ticker}_investment_research_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id="export-pdf-button"
      onClick={handleExport}
      disabled={loading}
      className="btn-secondary"
      style={{ gap: 8 }}
    >
      {loading ? (
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
      ) : (
        <Download size={14} />
      )}
      {loading ? "Generating PDF..." : "Export Report (PDF)"}
    </button>
  );
}
