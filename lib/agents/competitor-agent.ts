import { z } from "zod";
import { AgentState, Source } from './types';
import { fastLLM } from './llm';
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

    const blockedDomains = [
  "reddit.com",
  "youtube.com",
  "medium.com",
  "quora.com",
  "linkedin.com",
  "facebook.com",
  "twitter.com",
  "x.com",
];

const blockedKeywords = [
  "market size",
  "market report",
  "forecast",
  "statistics",
  "trends",
  "guide",
  "best",
  "top 10",
];

rawSources.forEach((res) => {
  const url = res.url.toLowerCase();
  const title = res.title.toLowerCase();

  if (blockedDomains.some((d) => url.includes(d))) {
    return;
  }

  if (blockedKeywords.some((k) => title.includes(k))) {
    return;
  }

  if (!uniqueUrls.has(res.url)) {
    uniqueUrls.add(res.url);

    sources.push({
      url: res.url,
      title: res.title,
      category: "Competitor",
    });

    contextString += `
Source: ${res.url}
Title: ${res.title}
Content: ${res.content.slice(0, 500)}

`;
  }
});
  } catch (e: any) {
    console.warn("[Competitor Agent] Tavily search failed, falling back to Gemini reasoning.", e.message || e);
    contextString = "No internet search context available. Fall back to your internal knowledge to identify likely competitors. Provide 'Unknown' for exact websites and recent funding if you are not sure.";
  }

  const modelWithStructure = fastLLM.withStructuredOutput(competitorSchema, { name: "competitors" });
  
  const prompt = `You are a Competitive Intelligence Agent for a venture capital firm.

Analyze the competitive landscape for the following startup idea:

"${state.startupIdea}"

Market Research Context:
${JSON.stringify(state.marketResearch)}

Real-time Search Context:
${contextString}

IMPORTANT RULES:

1. ONLY return actual companies or startups.
2. NEVER return:
   - articles
   - blogs
   - Reddit posts
   - market reports
   - research reports
   - statistics pages
   - news articles
   - publications

3. Every competitor must be a real company.
4. Use ONLY the companies found in the search context.
5. If funding cannot be verified:
   "Not publicly available"
6. If website cannot be verified:
   "Unknown"

Return:
- 3-5 direct competitors
- 2-4 indirect competitors
- competitive advantage

Extract:
companyName
website
description
funding
latestRound
recentActivity
similarityScore
`;

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
