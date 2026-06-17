import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState, Source } from "../agents/types";
import { researchAgent } from "../agents/research-agent";
import { competitorAgent } from "../agents/competitor-agent";
import { analysisAgent } from "../agents/analysis-agent";
import { reportAgent } from "../agents/report-agent";

// Define the state channels
const agentStateChannels = {
  startupIdea: {
    value: (x: string, y: string) => y ?? x,
    default: () => "",
  },
  marketResearch: {
    value: (x: Record<string, any>, y: Record<string, any>) => y ?? x,
  },
  competitors: {
    value: (x: Record<string, any>, y: Record<string, any>) => y ?? x,
  },
  swot: {
    value: (x: Record<string, any>, y: Record<string, any>) => y ?? x,
  },
  report: {
    value: (x: Record<string, any>, y: Record<string, any>) => y ?? x,
  },
  sources: {
    value: (x: Source[], y: Source[]) => {
      const all = (x || []).concat(y || []);
      const unique = new Map<string, Source>();
      all.forEach(s => unique.set(s.url, s));
      return Array.from(unique.values());
    },
    default: () => [],
  },
  status: {
    value: (x: string, y: string) => y ?? x,
    default: () => "pending",
  },
  error: {
    value: (x: string, y: string) => y ?? x,
  },
};

// Create the graph
export function createAnalyzeOrchestrator() {
  const workflow = new StateGraph<AgentState>({ channels: agentStateChannels as any })
    // Add nodes for each agent
    .addNode("researchAgent", researchAgent as any)
    .addNode("competitorAgent", competitorAgent as any)
    .addNode("analysisAgent", analysisAgent as any)
    .addNode("reportAgent", reportAgent as any)

    // Define edges (Sequential flow for now)
    .addEdge(START, "researchAgent")
    .addEdge("researchAgent", "competitorAgent")
    .addEdge("competitorAgent", "analysisAgent")
    .addEdge("analysisAgent", "reportAgent")
    .addEdge("reportAgent", END);

  // Compile the graph
  const app = workflow.compile();
  
  return app;
}

export async function runAnalysis(startupIdea: string): Promise<AgentState> {
  const app = createAnalyzeOrchestrator();
  
  const initialState: Partial<AgentState> = {
    startupIdea,
    sources: [],
    status: 'researching'
  };

  console.log(`[Orchestrator] Starting workflow for idea: ${startupIdea}`);
  
  // Run the graph
  const finalState = await app.invoke(initialState);
  
  return finalState as any as AgentState;
}
