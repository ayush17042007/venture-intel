export interface Source {
  url: string;
  title: string;
  category: 'Research' | 'Competitor';
}

export interface AgentState {
  startupIdea: string;
  marketResearch?: Record<string, any>;
  competitors?: Record<string, any>;
  swot?: Record<string, any>;
  report?: Record<string, any>;
  sources?: Source[];
  status: 'pending' | 'researching' | 'analyzing_competitors' | 'analyzing' | 'generating_report' | 'completed' | 'error';
  error?: string;
}
