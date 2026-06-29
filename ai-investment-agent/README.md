# AI Investment Research Agent

> A multi-agent AI system that researches any public company and delivers a professional **INVEST / HOLD / PASS** recommendation with full financial analysis, news sentiment, risk assessment, and an analyst memo — all running in a sequential LangGraph pipeline on a Next.js 16 web app.

---

## Overview

Type a company name. Hit **Analyze**. Within ~30 seconds, seven specialized AI agents run in sequence — each building on the previous agent's output — to produce:

| Output | What it contains |
|--------|-----------------|
| **Company Profile** | Ticker, sector, market cap, revenue, employees, competitors |
| **Financial Scorecard** | Four formula-scored dimensions (0-10): Growth, Profitability, Valuation, Financial Strength |
| **News Sentiment** | Up to 10 recent articles classified positive / negative / neutral with a 0-10 sentiment score |
| **Risk Matrix** | Five risk categories (Industry, Competition, Regulatory, Market, Valuation) each rated Low / Medium / High |
| **Bull vs Bear** | 3-5 evidence-backed arguments on each side with a strength score |
| **Investment Decision** | INVEST / HOLD / PASS with confidence %, reasoning, and time horizon |
| **Analyst Memo** | Full Goldman-Sachs-style equity research memo, exportable as PDF |
| **InvestBot Chat** | Floating AI assistant that explains the app and answers investing questions |

---

## How to Run

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- API keys for the four services below

### 1 - Clone and install

```bash
git clone <your-repo-url>
cd ai-investment-agent
npm install
```

### 2 - Configure environment variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```env
# Primary LLM
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NVIDIA_MODEL=meta/llama-3.3-70b-instruct

# Fallback LLM (optional)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# Data Sources
NEWS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ALPHA_VANTAGE_API_KEY=XXXXXXXXXXXXXXXXXX

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable | Where to get it | Required? |
|----------|----------------|-----------|
| `NVIDIA_API_KEY` | build.nvidia.com - API Keys | Yes |
| `NVIDIA_MODEL` | Any NIM-hosted model slug | Yes (default provided) |
| `OPENAI_API_KEY` | platform.openai.com | Fallback only |
| `NEWS_API_KEY` | newsapi.org - free tier works | Recommended |
| `ALPHA_VANTAGE_API_KEY` | alphavantage.co - free | Recommended |

> If ALPHA_VANTAGE_API_KEY is rate-limited (free tier: 25 calls/day), the LLM automatically fills in estimated financial data from its training knowledge. The app degrades gracefully.

### 3 - Run the dev server

```bash
npm run dev
```

Open http://localhost:3000. Type any company name in the search bar and click **Analyze**.

### 4 - Build for production

```bash
npm run build
npm start
```

---

## How It Works

### Architecture

The app runs on Next.js 16 (App Router) with all agent logic server-side via API Route Handlers. The LangGraph pipeline is compiled once into a reusable graph.

```
User (types company name)
        |
        v
POST /api/analyze  (Next.js Route Handler)
        |
        v
LangGraph StateGraph (sequential pipeline)
        |
        +-- [1] Research Agent      Yahoo Finance + Alpha Vantage + LLM enrichment
        |
        +-- [2] Financial Agent     Formula scoring + LLM reasoning
        |
        +-- [3] News Agent          NewsAPI fetch + LLM sentiment classification
        |
        +-- [4] Risk Agent          LLM risk matrix across 5 dimensions
        |
        +-- [5] Bull/Bear Agent     LLM debate - 3-5 arguments each side
        |
        +-- [6] Decision Agent      LLM synthesizes all signals -> INVEST/HOLD/PASS
        |
        +-- [7] Analyst Memo Agent  LLM writes professional equity research report
        |
        v
Next.js UI  (React components render each agent's output card)

User <--> InvestBot  (POST /api/chatbot  SSE streaming chat)
```

### Directory Structure

```
src/
|-- agents/
|   |-- researchAgent.ts      Agent 1: data fetching & LLM enrichment
|   |-- financialAgent.ts     Agent 2: formula scoring + LLM reasoning
|   |-- newsAgent.ts          Agent 3: news fetch + sentiment
|   |-- riskAgent.ts          Agent 4: 5-dimension risk matrix
|   |-- bullBearAgent.ts      Agent 5: bull/bear argument generation
|   |-- decisionAgent.ts      Agent 6: final recommendation
|   `-- analystMemoAgent.ts   Agent 7: professional memo
|-- graph/
|   `-- investmentGraph.ts    LangGraph StateGraph definition & compilation
|-- lib/
|   |-- llm.ts                LLM provider (NVIDIA NIM primary, OpenAI fallback)
|   `-- scoring.ts            Deterministic financial scoring formulas
|-- services/
|   |-- yahooFinance.ts       Ticker lookup via yahoo-finance2
|   |-- alphaVantage.ts       Fundamentals fetch (market cap, revenue, margins)
|   `-- newsApi.ts            News fetch with 15-min Next.js cache
|-- types/
|   `-- investment.ts         Zod schemas + TypeScript types for all agent outputs
|-- components/               React UI components (one per agent output card)
|   |-- SearchForm.tsx
|   |-- CompanyOverviewCard.tsx
|   |-- FinancialScoreCard.tsx
|   |-- NewsSummaryCard.tsx
|   |-- RiskCard.tsx
|   |-- BullBearCard.tsx
|   |-- RecommendationCard.tsx
|   |-- AnalystMemoCard.tsx
|   |-- ExportButton.tsx       PDF export via jsPDF
|   `-- ChatBot.tsx            Floating AI assistant (SSE streaming)
`-- app/
    |-- page.tsx              Landing / search page
    |-- layout.tsx            Root layout: includes ChatBot globally
    |-- globals.css           Design system tokens + animations
    `-- api/
        |-- analyze/route.ts  POST: runs the full LangGraph pipeline
        `-- chatbot/route.ts  POST: NVIDIA NIM streaming chat
```

### Agent-by-Agent Breakdown

#### Agent 1 - Research Agent (researchAgent.ts)
- Resolves the company name to a ticker using yahoo-finance2
- Fetches fundamentals from Alpha Vantage (market cap, revenue, P/E, margins, D/E, employees)
- If Alpha Vantage is rate-limited, uses the LLM with structured output (withStructuredOutput) to estimate all the same fields from training knowledge
- Merges real data (preferred) with LLM estimates (fallback) into a CompanyProfile

#### Agent 2 - Financial Agent (financialAgent.ts)
Runs deterministic formula scoring (no LLM involved in the math):
- Growth Score: revenue growth % mapped to 0-10 scale
- Profitability Score: net margin % mapped to 0-10 scale
- Valuation Score: P/E ratio vs benchmark (25x) mapped to 0-10 scale
- Financial Strength: debt-to-equity + current ratio mapped to 0-10
- Overall: weighted average (Growth x30% + Profit x25% + Valuation x20% + Strength x25%)
- LLM then explains the pre-calculated scores but does not alter them

#### Agent 3 - News Agent (newsAgent.ts)
- Fetches up to 10 recent articles from NewsAPI (cached 15 min via Next.js unstable_cache)
- LLM classifies each article (positive/negative/neutral), scores sentiment 0-10, generates a summary

#### Agent 4 - Risk Agent (riskAgent.ts)
- LLM evaluates five risk categories given all prior outputs as context
- Each category: Low/Medium/High rating + 2-sentence description + 1 mitigant sentence

#### Agent 5 - Bull/Bear Agent (bullBearAgent.ts)
- LLM writes 3-5 bullish arguments and 3-5 bearish arguments
- Each argument has a punchy title and 2-sentence evidence-backed detail
- LLM scores the strength of each side (0-10)

#### Agent 6 - Decision Agent (decisionAgent.ts)
- Receives all prior agent outputs as context
- LLM runs at temperature 0.05 (near-deterministic) for consistent decisions
- Produces: recommendation (INVEST/HOLD/PASS), confidence %, reasoning, key factors, time horizon

#### Agent 7 - Analyst Memo Agent (analystMemoAgent.ts)
- LLM writes a structured professional equity research memo (7 sections)
- Temperature 0.3 for higher writing quality
- Output is exportable as a formatted PDF via jsPDF

### LLM Infrastructure (lib/llm.ts)

Primary: NVIDIA NIM - OpenAI-compatible endpoint at https://integrate.api.nvidia.com/v1
Fallback: OpenAI (if NVIDIA key is not set)

All agents use LangChain's withStructuredOutput() with Zod schemas.
The LLM is forced to return valid, typed JSON. No manual parsing.

---

## Key Decisions and Trade-offs

### What was chosen and why

| Decision | Rationale |
|----------|-----------|
| Sequential graph, not parallel | Each agent builds on the previous one's output. The bull/bear agent needs financial scores; the decision agent needs everything. Sequential is the correct DAG for this dependency structure. |
| Formula scoring, not LLM scoring | Financial scores are computed deterministically. The LLM only explains them. This prevents hallucinated scores - a 7.2/10 for growth always means a specific revenue growth range. |
| Structured output (Zod + withStructuredOutput) | Every agent returns validated typed data. Eliminates JSON parsing errors and makes TypeScript types compile-safe from LLM output to React component. |
| Alpha Vantage + LLM fallback | Free tier is rate-limited at 25 calls/day. Rather than failing, the research agent falls back to LLM estimates. The app works at zero cost even under rate limits. |
| Next.js cache for news (15 min TTL) | NewsAPI free tier is rate-limited. Caching avoids repeated fetches for the same company and makes repeated queries faster. |
| NVIDIA NIM for the chatbot with SSE streaming | The chatbot streams tokens in real-time, making responses feel instantaneous rather than waiting for a full completion. |
| No database / no auth | Stateless is simpler for a research tool. Analysis results are kept in React state and URL params. A KV store could be added later if persistence is needed. |

### What was left out and why

| Omitted feature | Reason |
|----------------|--------|
| Real-time price quotes | Yahoo Finance quote() blocks on the free API; WebSocket live prices would double complexity without improving the core research value. |
| User accounts / saved analyses | Requires a database, auth provider, and significant UI changes - out of scope for a prototype. |
| Parallel agent execution | Some agents could theoretically run in parallel, but the LLM provider has rate limits and sequential is far easier to debug and reason about. |
| Historical price charts | Requires a price series endpoint. Alpha Vantage provides this but the free tier's 25 calls/day would be consumed instantly. |
| Backtesting / portfolio tracking | Needs a time-series database and significant additional engineering - well outside MVP scope. |

---

## Example Runs

### Run 1 - Apple (AAPL)

Input: "Apple"

Company Profile:
  Name: Apple Inc.
  Ticker: AAPL | Exchange: NASDAQ | Sector: Technology
  Market Cap: $3.4T | Revenue: $391.0B | Net Income: $97.0B
  Revenue Growth: 2.1% | Net Margin: 24.8% | P/E: 31.2x
  D/E: 1.77 | Employees: 164,000

Financial Scores:
  Growth Score:         4/10  (2.1% revenue growth is below the 15%+ high-score threshold)
  Profitability Score:  9/10  (24.8% net margin is top-decile among large-cap tech)
  Valuation Score:      5/10  (31.2x P/E is elevated vs 25x benchmark but justified by quality)
  Fin. Strength Score:  6/10  (D/E 1.77 reflects heavy buyback financing; current ratio adequate)
  Overall Score:        6.2/10

News Sentiment: Bullish (Positive: 7/10 | Negative: 3/10)
  Positive: Vision Pro enterprise adoption gaining traction
  Positive: Services revenue grew 14% YoY - highest-margin segment
  Negative: iPhone China shipments down amid Huawei competition

Risk Matrix:
  Industry Risk:    Low
  Competition Risk: Medium
  Regulatory Risk:  Medium
  Market Risk:      Low
  Valuation Risk:   Medium

Bull Arguments (Strength: 7/10):
  - Services flywheel compounds at 14%/yr with near-100% margins
  - Installed base of 2B+ devices creates an unassailable switching cost moat
  - AI integration into iOS opens a new hardware upgrade supercycle

Bear Arguments (Strength: 5/10):
  - China revenue (18% of total) is structurally at risk from geopolitical friction
  - iPhone unit volumes have been flat 3 years - growth depends entirely on Services
  - 31x P/E offers little margin of safety if macro conditions deteriorate

RECOMMENDATION: HOLD | Confidence: 72% | Time Horizon: 12-18 months

Reasoning: "Apple is a world-class business trading at a world-class price. The risk/reward
is not compelling enough to add at current levels, but the quality of the franchise warrants
holding existing positions. We would revisit at a 10-15% pullback."

Analyst Memo Excerpt:
Executive Summary: Apple Inc. remains the world's most valuable consumer technology franchise,
generating $391B in revenue with an exceptional 24.8% net margin. The Services segment
(App Store, iCloud, Apple TV+) has become the dominant growth engine, partially offsetting
iPhone volume maturity.

---

### Run 2 - Tesla (TSLA)

Input: "Tesla"

Company Profile:
  Name: Tesla, Inc.
  Ticker: TSLA | Exchange: NASDAQ | Sector: Consumer Cyclical
  Market Cap: $820B | Revenue: $97.7B | Net Income: $7.1B
  Revenue Growth: -1.1% | Net Margin: 7.3% | P/E: 68.4x
  D/E: 0.08 | Employees: 125,665

Financial Scores:
  Growth Score:         2/10  (Revenue declined YoY - alarming reversal for a growth stock)
  Profitability Score:  5/10  (7.3% margin is acceptable but down from 17% peak; price wars hurt)
  Valuation Score:      1/10  (68.4x P/E is extreme given negative growth and margin compression)
  Fin. Strength Score:  9/10  (D/E 0.08 - virtually debt-free; fortress balance sheet)
  Overall Score:        4.0/10

News Sentiment: Bearish (Positive: 3/10 | Negative: 7/10)
  Negative: Q1 2025 deliveries missed consensus by 7%
  Negative: European sales declined amid brand boycotts
  Positive: Cybertruck production ramping as planned
  Positive: Full Self-Driving v13 showing improved performance metrics

Risk Matrix:
  Industry Risk:    Medium
  Competition Risk: High
  Regulatory Risk:  Medium
  Market Risk:      High
  Valuation Risk:   High

Bull Arguments (Strength: 6/10):
  - FSD monetization could add $5-10K per car in high-margin software revenue
  - Energy storage (Megapack) growing 67% YoY - underappreciated business line
  - Balance sheet allows aggressive R&D investment competitors cannot match

Bear Arguments (Strength: 8/10):
  - BYD, Hyundai, and legacy OEMs are competitive on range/price at lower margins
  - At 68x P/E with -1% growth, the stock prices in perfection - any miss is punished hard
  - CEO distraction risk is unquantifiable but real and increasing

RECOMMENDATION: PASS | Confidence: 68% | Time Horizon: N/A

Reasoning: "Tesla's fundamentals do not support its current valuation. Revenue is declining,
margins are compressing, and competition is intensifying. The bull case relies on future
optionality (FSD, Robotaxi, Energy) that is years away from being material. We see better
risk/reward elsewhere in the EV and technology space."

Analyst Memo Excerpt:
Investment Thesis: Tesla's core auto business is under structural pressure from Chinese
competition and price-war dynamics that have compressed gross margins from 25% to under 18%.
The market is paying a 68x P/E multiple for a business growing at -1% - an unsustainable
premium that requires near-flawless execution of multiple unproven future revenue streams.

---

### Run 3 - Palantir (PLTR)

Input: "Palantir"

Company Profile:
  Name: Palantir Technologies Inc.
  Ticker: PLTR | Exchange: NYSE | Sector: Technology
  Market Cap: $280B | Revenue: $2.8B | Net Income: $462M
  Revenue Growth: 36.0% | Net Margin: 16.5% | P/E: 220.4x
  D/E: 0.05 | Employees: 3,946

Financial Scores:
  Growth Score:         10/10  (36% revenue growth is elite - top 5% of large-cap tech)
  Profitability Score:  7/10   (16.5% net margin shows the operating model is proven)
  Valuation Score:      0/10   (220x P/E is among the highest in the S&P 500)
  Fin. Strength Score:  10/10  (Near-zero debt, strong cash generation)
  Overall Score:        6.5/10

News Sentiment: Bullish (Positive: 8/10 | Negative: 2/10)
  Positive: US Commercial revenue accelerated to 55% YoY growth
  Positive: Added to S&P 500 - passive fund inflows ongoing
  Positive: AIP (AI Platform) contracts expanding to Fortune 500
  Negative: Government contract renewal uncertainty in Q3

Risk Matrix:
  Industry Risk:    Low
  Competition Risk: Medium
  Regulatory Risk:  Low
  Market Risk:      High
  Valuation Risk:   High

Bull Arguments (Strength: 8/10):
  - AIP is the enterprise AI deployment platform with no clear equivalent at scale
  - US Commercial growing 55% YoY - total addressable market is enormous
  - Government contracts create durable, high-margin recurring revenue that competitors cannot easily displace

Bear Arguments (Strength: 7/10):
  - At 220x P/E, a multiple compression alone could cut the stock in half without any operational miss
  - Microsoft, Google, and AWS are building competing enterprise AI platforms with vastly larger distribution
  - Revenue base of $2.8B is still tiny relative to the $280B market cap implied

RECOMMENDATION: HOLD | Confidence: 61% | Time Horizon: Long-term (3-5 years)

Reasoning: "Palantir is building a genuinely differentiated AI platform with accelerating
commercial traction. However, the current valuation leaves zero room for error. We rate it
HOLD - suitable for investors with long time horizons who already hold a position, but not
a compelling entry point for new capital at these prices."

Analyst Memo Excerpt:
Financial Health: Palantir's $2.8B revenue base is growing at an exceptional 36% annually,
with US Commercial as the standout segment at 55% growth. The 16.5% net margin and negligible
debt (D/E: 0.05) demonstrate that the business generates real profits at scale, not just
growth-at-all-costs. However, the $280B market cap implies investors are pricing in 15+ years
of hypergrowth at current rates - a scenario with very narrow odds of achievement.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Agent Orchestration | LangGraph.js |
| LLM Client | LangChain @langchain/openai (OpenAI-compatible) |
| Primary LLM | NVIDIA NIM - meta/llama-3.3-70b-instruct |
| Financial Data | Alpha Vantage API + yahoo-finance2 |
| News Data | NewsAPI.org |
| Schema Validation | Zod |
| PDF Export | jsPDF + jspdf-autotable |
| Styling | Vanilla CSS (design tokens) + Tailwind utility classes |
| Charts | Recharts |
| Language | TypeScript 5 |

---

> Disclaimer: This tool is for educational and informational purposes only.
> It does not constitute financial advice.
> Always do your own research before making investment decisions.
