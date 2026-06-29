import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { researchAgent } from "../agents/researchAgent";
import { financialAgent } from "../agents/financialAgent";
import { newsAgent } from "../agents/newsAgent";
import { riskAgent } from "../agents/riskAgent";
import { bullBearAgent } from "../agents/bullBearAgent";
import { decisionAgent } from "../agents/decisionAgent";
import { analystMemoAgent } from "../agents/analystMemoAgent";
import type {
  CompanyProfile,
  FinancialAnalysis,
  NewsAnalysis,
  RiskAnalysis,
  BullBearAnalysis,
  InvestmentDecision,
  AnalystMemo,
} from "../types/investment";

// ── LangGraph State Annotation ────────────────────────────────
const ResearchStateAnnotation = Annotation.Root({
  company: Annotation<string>({ reducer: (_, b) => b }),
  companyProfile: Annotation<CompanyProfile | undefined>({ reducer: (_, b) => b }),
  financialAnalysis: Annotation<FinancialAnalysis | undefined>({ reducer: (_, b) => b }),
  newsAnalysis: Annotation<NewsAnalysis | undefined>({ reducer: (_, b) => b }),
  riskAnalysis: Annotation<RiskAnalysis | undefined>({ reducer: (_, b) => b }),
  bullBearAnalysis: Annotation<BullBearAnalysis | undefined>({ reducer: (_, b) => b }),
  investmentDecision: Annotation<InvestmentDecision | undefined>({ reducer: (_, b) => b }),
  analystMemo: Annotation<AnalystMemo | undefined>({ reducer: (_, b) => b }),
  error: Annotation<string | undefined>({ reducer: (_, b) => b }),
  completedAgents: Annotation<string[]>({
    reducer: (a, b) => [...new Set([...a, ...b])],
    default: () => [],
  }),
});

// ── Build the Graph ──────────────────────────────────────────
const workflow = new StateGraph(ResearchStateAnnotation)
  .addNode("research",    researchAgent)
  .addNode("financial",   financialAgent)
  .addNode("news",        newsAgent)
  .addNode("risk",        riskAgent)
  .addNode("bullbear",    bullBearAgent)
  .addNode("decision",    decisionAgent)
  .addNode("analystmemo", analystMemoAgent)
  .addEdge(START,         "research")
  .addEdge("research",    "financial")
  .addEdge("financial",   "news")
  .addEdge("news",        "risk")
  .addEdge("risk",        "bullbear")
  .addEdge("bullbear",    "decision")
  .addEdge("decision",    "analystmemo")
  .addEdge("analystmemo", END);

export const investmentGraph = workflow.compile();

export type InvestmentGraphState = typeof ResearchStateAnnotation.State;
