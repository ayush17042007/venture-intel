import { ChatGroq } from "@langchain/groq";

console.log('[LLM] Using Groq');
console.log('[Model] llama-3.1-8b-instant and llama-3.3-70b-versatile');

export const fastLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.2,
});

export const smartLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
});
