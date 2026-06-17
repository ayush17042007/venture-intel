'use client'

import { useState } from 'react'
import { ChevronDown, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'

interface ReportSection {
  title: string
  content: string[]
}

export function InvestorReportSection({ data }: { data?: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data) return null;

  const sections: ReportSection[] = [
    {
      title: 'Executive Summary',
      content: [data.executiveSummary || 'No executive summary provided.'],
    },
    {
      title: 'Final Recommendation',
      content: [
        `Recommendation: ${data.recommendation || 'None'}`,
        'Based on the full market, competitive, and strategic analysis provided by the intelligence agents.'
      ],
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
            <FileText className="w-5 h-5 text-foreground" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold">Investor Report</h3>
            <p className="text-sm text-muted-foreground">Investment thesis and opportunity assessment</p>
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
        <div className="space-y-5 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="p-6 rounded-lg border border-border/30 bg-card/20"
              style={{
                animationDelay: `${sectionIndex * 120}ms`,
              }}
            >
              {/* Section Header */}
              <div className="flex items-start gap-3 mb-4">
                {sectionIndex === sections.length - 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                ) : sectionIndex === 3 ? (
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                ) : (
                  <FileText className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                )}
                <h4 className="text-base font-semibold text-foreground">{section.title}</h4>
              </div>

              {/* Section Content */}
              <div className="space-y-4">
                {section.content.map((paragraph, paraIndex) => (
                  <p key={paraIndex} className="text-sm leading-relaxed text-foreground/85 text-pretty">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Investment Highlights Box */}
          <div className="p-6 rounded-lg border border-foreground/20 bg-foreground/5 backdrop-blur-sm">
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-2">Key Takeaways</h4>
                <ul className="space-y-2 text-sm text-foreground/80">
                  {(data.keyTakeaways || []).map((takeaway: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 mt-1.5 flex-shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
