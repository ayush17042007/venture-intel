import { ChatGroq } from "@langchain/groq";

console.log("[LLM] Using Groq");
console.log("[Model] Multi-key setup");

export const researchLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY_1,
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.2,
});

export const competitorLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY_1,
  model: "openai/gpt-oss-120b",
  temperature: 0.2,
});

export const analysisLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY_2,
  model: "llama-3.1-8b-instant",
  temperature: 0.2,
});

export const reportLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY_2,
  model: "openai/gpt-oss-120b",
  temperature: 0.2,
});