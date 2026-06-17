import { z } from "zod";
import { AgentState, Source } from './types';
import { llm } from './llm';
import { performSearch } from './tavily-client';

const competitorProfileSchema = z.object({
  companyName: z.string(),
  website: z.string().describe("Company website URL. Provide 'Unknown' if not found."),
  description: z.string(),
  funding: z.string().describe("Total funding. If cannot be verified, return 'Not publicly available'."),
  latestRound: z.string().describe("Latest funding round. If cannot be verified, return 'Not publicly available'."),
  recentActivity: z.string().describe("Recent notable activity, partnerships, or product launches."),
  similarityScore: z.number().describe("0-100 similarity score compared to the proposed startup idea."),
});

const competitorSchema = z.object({
  directCompetitors: z.array(competitorProfileSchema).describe("Main direct competitors"),
  indirectCompetitors: z.array(competitorProfileSchema).describe("Indirect or alternative competitors"),
  competitiveAdvantage: z.string().describe("Potential competitive advantage for this new startup"),
});

export async function competitorAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log(`[Competitor Agent] Analyzing competitors for: ${state.startupIdea}`);
  
  let sources: Source[] = [];
  let contextString = "";
  
  try {
    const compSearch = await performSearch(`startups competitors similar to ${state.startupIdea}`);
    const fundingSearch = await performSearch(`funding rounds for competitors of ${state.startupIdea}`);
    
    const rawSources = [...compSearch.results, ...fundingSearch.results];
    
    const uniqueUrls = new Set<string>();

    rawSources.forEach(res => {
      if (!uniqueUrls.has(res.url)) {
        uniqueUrls.add(res.url);
        sources.push({ url: res.url, title: res.title, category: 'Competitor' });
        contextString += `Source: ${res.url}\nTitle: ${res.title}\nContent: ${res.content}\n\n`;
      }
    });
  } catch (e: any) {
    console.warn("[Competitor Agent] Tavily search failed, falling back to Gemini reasoning.", e.message || e);
    contextString = "No internet search context available. Fall back to your internal knowledge to identify likely competitors. Provide 'Unknown' for exact websites and recent funding if you are not sure.";
  }

  const modelWithStructure = llm.withStructuredOutput(competitorSchema, { name: "competitors" });
  
  const prompt = `You are a Competitive Intelligence Agent for a venture capital firm.
Analyze the competitive landscape for the following startup idea:
"${state.startupIdea}"

Market Research Context:
${JSON.stringify(state.marketResearch)}

Real-time Search Context:
${contextString}

Identify direct and indirect competitors using ONLY the Search Context above if available.
Extract the companyName, website, description, funding, latestRound, recentActivity, and similarityScore.
If funding or latest round cannot be verified, explicitly return: "Not publicly available".
Determine a potential competitive advantage.`;

  try {
    const response = await modelWithStructure.invoke(prompt);
    
    return {
      competitors: response,
      sources,
      status: 'analyzing'
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
