import { z } from "zod";
import { AgentState, Source } from './types';
import { llm } from './llm';
import { performSearch } from './tavily-client';

const researchSchema = z.object({
  marketSize: z.string().describe("Estimated market size and growth potential. MUST include inline citations to provided sources."),
  trends: z.array(z.string()).describe("Key industry trends relevant to the idea. MUST include citations."),
  targetAudience: z.string().describe("Primary target audience or customer segments. MUST include citations."),
});

export async function researchAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log(`[Research Agent] Starting research for: ${state.startupIdea}`);
  
  let sources: Source[] = [];
  let contextString = "";
  
  try {
    // Perform searches using the cached/limited client
    const marketSizeSearch = await performSearch(`market size for ${state.startupIdea}`);
    const audienceSearch = await performSearch(`target audience for ${state.startupIdea}`);
    const trendsSearch = await performSearch(`industry trends for ${state.startupIdea}`);
    
    // Combine results
    const rawSources = [...marketSizeSearch.results, ...audienceSearch.results, ...trendsSearch.results];
    
    // Deduplicate sources by URL (Requirement 1)
    const uniqueUrls = new Set<string>();

    rawSources.forEach(res => {
      if (!uniqueUrls.has(res.url)) {
        uniqueUrls.add(res.url);
        sources.push({ url: res.url, title: res.title, category: 'Research' });
        contextString += `Source: ${res.url}\nTitle: ${res.title}\nContent: ${res.content}\n\n`;
      }
    });
  } catch (e: any) {
    console.warn("[Research Agent] Tavily search failed, falling back to Gemini reasoning.", e.message || e);
    // Requirement 5: Gracefully fall back to Gemini-only analysis
    contextString = "No internet search context available. Fall back to your internal knowledge to estimate the market size, trends, and target audience. You do not need to cite sources since search failed.";
  }

  const modelWithStructure = llm.withStructuredOutput(researchSchema, { name: "marketResearch" });
  
  const prompt = `You are an expert Research Analyst for a venture capital firm.
Conduct comprehensive market research for the following startup idea:
"${state.startupIdea}"

Use the following real-time search context to formulate your answers. If context is provided, you MUST include explicit citations in your text (e.g., [1] or linking the URL) using ONLY the sources provided below.

Search Context:
${contextString}

Provide the market size, key trends, and target audience.`;

  try {
    const response = await modelWithStructure.invoke(prompt);
    
    return {
      marketResearch: response,
      sources,
      status: 'analyzing_competitors'
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
