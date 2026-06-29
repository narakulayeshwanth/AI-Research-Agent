import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "AI Investment Research Agent | Altuni AI Labs",
  description:
    "AI-powered investment research agent that analyzes companies using multi-agent LangGraph workflows — delivering INVEST, HOLD, or PASS recommendations with full financial analysis, news sentiment, risk assessment, and professional analyst memos.",
  keywords: ["AI investment research", "stock analysis", "LangGraph", "NVIDIA NIM", "financial AI", "equity research"],
  authors: [{ name: "Altuni AI Labs" }],
  openGraph: {
    title: "AI Investment Research Agent",
    description: "Make smarter investment decisions with AI-powered multi-agent research.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="bg-mesh" aria-hidden="true" />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        <ChatBot />
      </body>
    </html>
  );
}
