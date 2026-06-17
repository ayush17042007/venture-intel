import { z } from "zod";
import { AgentState } from './types';
import { smartLLM } from './llm';

const analysisSchema = z.object({
  swot: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
  risks: z.array(z.string()).describe("Key execution, market, or technical risks"),
});

export async function analysisAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log(`[Analysis Agent] Performing core analysis for: ${state.startupIdea}`);
  
  const modelWithStructure = smartLLM.withStructuredOutput(analysisSchema, { name: "swot" });
  
  const prompt = `You are a Principal Analyst at a venture capital firm.
Perform a SWOT analysis and risk assessment for the following startup idea:
"${state.startupIdea}"

Context:
Research: ${JSON.stringify(state.marketResearch)}
Competitors: ${JSON.stringify(state.competitors)}`;

  try {
    const response = await modelWithStructure.invoke(prompt);
    
    return {
      swot: response,
      status: 'generating_report'
    };
  } catch (error: any) {
    let errorMessage = "Request failed";
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes('rate limit') || error.status === 429) {
      errorMessage = "Rate limit exceeded";
    } else if (msg.includes('api key') || error.status === 401 || msg.includes('authentication')) {
      errorMessage = "Invalid API key";
    } else if (msg.includes('network') || error.code === 'ECONNREFUSED') {
      errorMessage = "Network failure";
    } else {
      errorMessage = error.message || errorMessage;
    }
    console.error(`[Groq] ${errorMessage}`);
    return { error: `[Groq] ${errorMessage}`, status: 'error' };
  }
}
