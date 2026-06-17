'use client'

import { useState } from 'react'
import { ChevronDown, BookOpen } from 'lucide-react'

interface ResearchCard {
  id: string
  title: string
  summary: string
  confidence: number
  sourceCount: number
}

export function ResearchSection({ data, sourceCount = 0 }: { data?: any, sourceCount?: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data) return null;

  const RESEARCH_CARDS = [
    {
      id: 'market-size',
      title: 'Market Size',
      summary: data.marketSize,
      confidence: 92,
    },
    {
      id: 'target-audience',
      title: 'Target Audience',
      summary: data.targetAudience,
      confidence: 88,
    },
    {
      id: 'key-trends',
      title: 'Key Trends',
      summary: data.trends?.join(', '),
      confidence: 85,
    }
  ]

  return (
    <div className="w-full space-y-4">
      {/* Header with Expand Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(60,60,60,60,60,60,0.1)] transition-all duration-300 ease-out group active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-foreground transition-colors duration-300 group-hover:text-accent" />
          <div className="text-left">
            <h3 className="text-base font-semibold text-foreground">Market Intelligence</h3>
            <p className="text-xs text-muted-foreground">{RESEARCH_CARDS.length} research findings from {sourceCount} sources</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {RESEARCH_CARDS.map((card, index) => (
            <div
              key={card.id}
              className="group p-5 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-card/50 hover:border-accent/30 hover:shadow-[0_8px_24px_rgba(60,60,60,0.15)] hover:translate-y-[-2px] transition-all duration-300 ease-out"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-sm font-medium text-foreground">{card.title}</h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{card.confidence}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground/70 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${card.confidence}%` }}
                  />
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground leading-relaxed">{card.summary}</p>

                {/* Removed card-level source counts per requirements */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
