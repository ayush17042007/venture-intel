import { z } from "zod";
import { AgentState } from './types';
import { llm } from './llm';

const reportSchema = z.object({
  executiveSummary: z.string().describe("A compelling 2-3 paragraph executive summary"),
  recommendation: z.enum(["Strong Invest", "Invest", "Pass", "Strong Pass"]).describe("Investment recommendation"),
  keyTakeaways: z.array(z.string()).describe("3-5 key takeaways for the investment committee"),
});

export async function reportAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log(`[Report Agent] Generating final investor report for: ${state.startupIdea}`);
  
  const modelWithStructure = llm.withStructuredOutput(reportSchema, { name: "report" });
  
  const prompt = `You are an Investment Partner at a top-tier venture capital firm.
Write a final investment report and recommendation for this startup idea:
"${state.startupIdea}"

Context provided by the team:
Research: ${JSON.stringify(state.marketResearch)}
Competitors: ${JSON.stringify(state.competitors)}
Analysis: ${JSON.stringify(state.swot)}

Provide an executive summary, an investment recommendation, and key takeaways.`;

  try {
    const response = await modelWithStructure.invoke(prompt);
    
    return {
      report: response,
      status: 'completed'
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
