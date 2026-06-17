import { ChatGroq } from "@langchain/groq";

console.log('[LLM] Using Groq');
console.log('[Model] llama-3.3-70b-versatile');

export const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
});
