import { AgentState, Source } from './types';
import { researchLLM } from './llm';
import { performSearch } from './tavily-client';

export async function researchAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log(`[Research Agent] Starting research for: ${state.startupIdea}`);

  let sources: Source[] = [];
  let contextString = "";

  try {
    const [marketSizeSearch, audienceSearch, trendsSearch] =
      await Promise.all([
        performSearch(`market size for ${state.startupIdea}`),
        performSearch(`target audience for ${state.startupIdea}`),
        performSearch(`industry trends for ${state.startupIdea}`),
      ]);

    const rawSources = [
      ...marketSizeSearch.results,
      ...audienceSearch.results,
      ...trendsSearch.results,
    ];

    const uniqueUrls = new Set<string>();

    const blockedDomains = [
      "reddit.com",
      "quora.com",
      "youtube.com",
      "instagram.com",
      "tiktok.com",
      "facebook.com",
    ];

    let sourceCount = 0;

    rawSources.forEach((res) => {
      if (sourceCount >= 10) return;

      const url = res.url.toLowerCase();

      if (
        blockedDomains.some((domain) => url.includes(domain))
      ) {
        return;
      }

      if (!uniqueUrls.has(res.url)) {
        uniqueUrls.add(res.url);
        sourceCount++;

        sources.push({
          url: res.url,
          title: res.title,
          category: "Research",
        });

        contextString += `
Source: ${res.url}
Title: ${res.title}
Content: ${res.content.slice(0, 300)}

`;
      }
    });

  } catch (e: any) {
    console.warn(
      "[Research Agent] Tavily search failed",
      e.message || e
    );

    contextString =
      "No internet search context available.";
  }

  const prompt = `
You are a venture capital research analyst.

Analyze this startup idea:

"${state.startupIdea}"

Using the search context below, return ONLY valid JSON.

DO NOT use markdown.
DO NOT use code fences.
DO NOT explain anything.

Required format:

{
  "marketSize": "string",
  "trends": ["string"],
  "targetAudience": "string"
}

Search Context:

${contextString}
`;

  try {
    const response = await researchLLM.invoke(prompt);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const marketResearch = JSON.parse(content);

    console.log(
      "[Research Agent] Success:",
      JSON.stringify(marketResearch)
    );

    return {
      marketResearch,
      sources,
      status: "analyzing_competitors",
    };

  } catch (error: any) {

    console.error(
      "[Research Agent FULL ERROR]",
      JSON.stringify(error, null, 2)
    );

    let errorMessage = "Request failed";

    const msg = error.message?.toLowerCase() || "";

    if (msg.includes("rate limit") || error.status === 429) {
      errorMessage = "Rate limit exceeded";
    } else if (
      msg.includes("api key") ||
      error.status === 401
    ) {
      errorMessage = "Invalid API key";
    } else if (
      msg.includes("network") ||
      error.code === "ECONNREFUSED"
    ) {
      errorMessage = "Network failure";
    } else if (
      msg.includes("json")
    ) {
      errorMessage = "Invalid JSON returned by model";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error(`[Research Agent] ${errorMessage}`);

    return {
      error: `[Research Agent] ${errorMessage}`,
      status: "error",
    };
  }
}