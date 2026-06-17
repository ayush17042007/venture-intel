import { AgentState } from './types';
import { analysisLLM } from './llm';

export async function analysisAgent(
state: AgentState
): Promise<Partial<AgentState>> {
console.log(
`[Analysis Agent] Performing core analysis for: ${state.startupIdea}`
);

const prompt = `
You are a Principal Analyst at a venture capital firm.

Perform a SWOT analysis and risk assessment.

Return ONLY valid JSON.

{
"strengths": [],
"weaknesses": [],
"opportunities": [],
"threats": [],
"risks": []
}

Startup Idea:
${state.startupIdea}

Market Research:
${JSON.stringify(state.marketResearch)}

Competitors:
${JSON.stringify(
state.competitors?.directCompetitors?.map((c: any) => ({
name: c.companyName,
description: c.description,
})) || []
)}

Rules:

* Return valid JSON only.
* Do not wrap in markdown.
* Provide 4-6 items for each category.
* Keep each item concise.
  `;

  try {
  const response = await analysisLLM.invoke(prompt);

  let content = String(response.content).trim();

  // Remove accidental markdown fences if model adds them
  content = content
  .replace(/^`json\s*/i, '')
      .replace(/^`\s*/i, '')
  .replace(/\s*```$/i, '');

  const parsed = JSON.parse(content);

  return {
  swot: {
  swot: {
  strengths: parsed.strengths || [],
  weaknesses: parsed.weaknesses || [],
  opportunities: parsed.opportunities || [],
  threats: parsed.threats || [],
  },
  risks: parsed.risks || [],
  },
  status: 'generating_report',
  };
  } catch (error: any) {
  console.error(
  '[Analysis Agent Error]',
  error
  );

  return {
  error:
  error?.message ||
  'Failed to generate SWOT analysis',
  status: 'error',
  };
  }
  }
