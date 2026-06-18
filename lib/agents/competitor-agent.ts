import { z } from "zod";
import { AgentState, Source } from './types';
import { competitorLLM } from './llm';
import { performSearch } from './tavily-client';

const competitorProfileSchema = z.object({
  companyName: z.string(),
  website: z.string().optional().default("Unknown"),
  description: z.string(),

  funding: z.string().optional().default("Not publicly available"),

  latestRound: z.string().optional().default("Not publicly available"),

  recentActivity: z.string().optional().default("Not publicly available"),

  similarityScore: z.coerce.number().min(0).max(100),
});

const competitorSchema = z.object({
  directCompetitors: z.array(competitorProfileSchema).default([]),

  indirectCompetitors: z.array(competitorProfileSchema).default([]),

  competitiveAdvantage: z.string().default("No competitive advantage identified"),
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
  "instagram.com",
  "tiktok.com",
  "pinterest.com"
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
Content: ${res.content.slice(0, 300)}

`;
  }
});
  } catch (e: any) {
    console.warn("[Competitor Agent] Tavily search failed, falling back to Gemini reasoning.", e.message || e);
    contextString = "No internet search context available. Fall back to your internal knowledge to identify likely competitors. Provide 'Unknown' for exact websites and recent funding if you are not sure.";
  }

  const modelWithStructure = competitorLLM.withStructuredOutput(competitorSchema, { name: "competitors" });
  
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
    console.log(
  `[Competitor Agent] Context Length: ${contextString.length}`
);

const response = await modelWithStructure.invoke(prompt);

console.log(
  "[Competitor Agent] Success:",
  JSON.stringify(response).slice(0, 500)
);
    
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
    console.error(
  "[Competitor Agent FULL ERROR]",
  JSON.stringify(error, null, 2)
);

console.error(
  "[Competitor Agent MESSAGE]",
  error?.message
);

console.error(
  "[Competitor Agent STATUS]",
  error?.status
);
    return {
  competitors: {
    directCompetitors: [],
    indirectCompetitors: [],
    competitiveAdvantage: "Unable to generate competitor analysis"
  },
  sources,
  status: 'analyzing'
};
  }
}
