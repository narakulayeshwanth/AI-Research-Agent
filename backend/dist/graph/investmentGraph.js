"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investmentGraph = void 0;
const langgraph_1 = require("@langchain/langgraph");
const researchAgent_1 = require("../agents/researchAgent");
const financialAgent_1 = require("../agents/financialAgent");
const newsAgent_1 = require("../agents/newsAgent");
const riskAgent_1 = require("../agents/riskAgent");
const bullBearAgent_1 = require("../agents/bullBearAgent");
const decisionAgent_1 = require("../agents/decisionAgent");
const analystMemoAgent_1 = require("../agents/analystMemoAgent");
// ── LangGraph State Annotation ────────────────────────────────
const ResearchStateAnnotation = langgraph_1.Annotation.Root({
    company: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    companyProfile: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    financialAnalysis: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    newsAnalysis: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    riskAnalysis: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    bullBearAnalysis: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    investmentDecision: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    analystMemo: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    error: (0, langgraph_1.Annotation)({ reducer: (_, b) => b }),
    completedAgents: (0, langgraph_1.Annotation)({
        reducer: (a, b) => [...new Set([...a, ...b])],
        default: () => [],
    }),
});
// ── Build the Graph ──────────────────────────────────────────
const workflow = new langgraph_1.StateGraph(ResearchStateAnnotation)
    .addNode("research", researchAgent_1.researchAgent)
    .addNode("financial", financialAgent_1.financialAgent)
    .addNode("news", newsAgent_1.newsAgent)
    .addNode("risk", riskAgent_1.riskAgent)
    .addNode("bullbear", bullBearAgent_1.bullBearAgent)
    .addNode("decision", decisionAgent_1.decisionAgent)
    .addNode("analystmemo", analystMemoAgent_1.analystMemoAgent)
    .addEdge(langgraph_1.START, "research")
    .addEdge("research", "financial")
    .addEdge("financial", "news")
    .addEdge("news", "risk")
    .addEdge("risk", "bullbear")
    .addEdge("bullbear", "decision")
    .addEdge("decision", "analystmemo")
    .addEdge("analystmemo", langgraph_1.END);
exports.investmentGraph = workflow.compile();
//# sourceMappingURL=investmentGraph.js.map