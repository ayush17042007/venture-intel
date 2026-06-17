'use client'

import { useState } from 'react'
import { ChevronDown, Lightbulb, AlertCircle, TrendingUp, Shield } from 'lucide-react'

interface AnalysisInsight {
  title: string
  description: string
  items: string[]
  icon: React.ReactNode
}

export function AnalysisSection({ data }: { data?: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data || !data.swot) return null;

  const insights: AnalysisInsight[] = [
    {
      title: 'Strengths',
      description: 'Core competitive advantages and differentiation factors',
      items: data.swot.strengths || [],
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      title: 'Weaknesses',
      description: 'Internal challenges and resource constraints',
      items: data.swot.weaknesses || [],
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      title: 'Opportunities',
      description: 'Market conditions and strategic expansion areas',
      items: data.swot.opportunities || [],
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      title: 'Risks & Threats',
      description: 'Potential threats and mitigation considerations',
      items: [...(data.swot.threats || []), ...(data.risks || [])],
      icon: <Shield className="w-5 h-5" />,
    },
  ]

  return (
    <div className="mt-8 space-y-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-foreground" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold">Analysis</h3>
            <p className="text-sm text-muted-foreground">SWOT insights and strategic assessment</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {insights.map((insight, index) => (
            <div
              key={insight.title}
              className="p-6 rounded-lg border border-border/30 bg-card/20 hover:bg-card/40 transition-colors"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-1">
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                  <ul className="space-y-2">
                    {insight.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex gap-3 text-sm text-foreground/80">
                        <span className="inline-block w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
