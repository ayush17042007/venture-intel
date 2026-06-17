import { tavily } from "@tavily/core";

// Simple in-memory cache for the session
const searchCache = new Map<string, any>();

export async function performSearch(query: string): Promise<any> {
  const apiKey = process.env.TAVILY_API_KEY || "tvly-invalid";
  
  if (searchCache.has(query)) {
    console.log(`[Tavily] Cache hit for query: "${query}"`);
    return searchCache.get(query)!;
  }

  console.log(`[Tavily] Executing search for: "${query}"`);
  
  const tvly = tavily({ apiKey });

  // Wrap the call in a Promise with a timeout
  const timeoutMs = 15000; // 15 seconds
  
  const searchPromise = tvly.search(query, {
    searchDepth: "advanced",
    maxResults: 5, // Requirement 2: Limit to top 5 most relevant sources
    includeImages: false,
  });

  const timeoutPromise = new Promise<any>((_, reject) => {
    setTimeout(() => reject(new Error(`Tavily search timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    const results = await Promise.race([searchPromise, timeoutPromise]);
    // Cache the successful result (Requirement 3: Cache responses)
    searchCache.set(query, results);
    return results;
  } catch (error: any) {
    console.error(`[Tavily] Error searching for "${query}":`, error.message || error);
    throw error;
  }
}
