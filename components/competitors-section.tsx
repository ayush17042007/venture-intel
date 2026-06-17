'use client'

import { useState } from 'react'
import { ChevronDown, Building2 } from 'lucide-react'

interface CompetitorProfile {
  id: string
  name: string
  description: string
  funding: {
    total: string
    lastRound: string
    recentActivity: string
  }
  similarity: number
  marketPosition: string
}

export function CompetitorsSection({ data }: { data?: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data) return null

  const deduplicate = (comps: any[]) => {
    const unique = new Map()
    comps.forEach((c) =>
      unique.set((c.companyName || c.name || '').toLowerCase(), c)
    )
    return Array.from(unique.values())
  }

  const normalizeSimilarity = (
    score: any,
    fallback: number
  ): number => {
    if (score === undefined || score === null) {
      return fallback
    }

    const num = Number(score)

    if (isNaN(num)) {
      return fallback
    }

    // Convert 0.8 -> 80
    if (num > 0 && num <= 1) {
      return Math.round(num * 100)
    }

    return Math.round(num)
  }

  const COMPETITORS = [
    ...deduplicate(data.directCompetitors || []).map(
      (c: any, i: number) => ({
        id: `direct-${i}`,
        name: c.companyName || c.name || 'Unknown',
        website: c.website,
        description: c.description,
        funding: {
          total: c.funding,
          lastRound: c.latestRound,
          recentActivity: c.recentActivity,
        },
        similarity: normalizeSimilarity(
          c.similarityScore,
          85 - i * 5
        ),
        marketPosition: 'Direct Competitor',
      })
    ),

    ...deduplicate(data.indirectCompetitors || []).map(
      (c: any, i: number) => ({
        id: `indirect-${i}`,
        name: c.companyName || c.name || 'Unknown',
        website: c.website,
        description: c.description,
        funding: {
          total: c.funding,
          lastRound: c.latestRound,
          recentActivity: c.recentActivity,
        },
        similarity: normalizeSimilarity(
          c.similarityScore,
          60 - i * 5
        ),
        marketPosition: 'Indirect Competitor',
      })
    ),
  ]

  return (
    <div className="w-full space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(60,60,60,0.1)] transition-all duration-300 ease-out group active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-foreground transition-colors duration-300 group-hover:text-accent" />
          <div className="text-left">
            <h3 className="text-base font-semibold text-foreground">
              Competitive Intelligence
            </h3>
            <p className="text-xs text-muted-foreground">
              {COMPETITORS.length} competitor profiles identified
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {COMPETITORS.map((competitor, index) => (
            <div
              key={competitor.id}
              className="group p-5 rounded-lg border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-card/50 hover:border-accent/30 hover:shadow-[0_8px_24px_rgba(60,60,60,0.15)] hover:translate-y-[-2px] transition-all duration-300 ease-out"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {competitor.website &&
                    competitor.website !== 'Unknown' ? (
                      <a
                        href={
                          competitor.website.startsWith('http')
                            ? competitor.website
                            : `https://${competitor.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-foreground hover:underline hover:text-accent transition-colors"
                      >
                        {competitor.name}
                      </a>
                    ) : (
                      <h4 className="text-sm font-semibold text-foreground">
                        {competitor.name}
                      </h4>
                    )}

                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {competitor.marketPosition}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {competitor.similarity}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Similarity
                    </p>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground/70 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${competitor.similarity}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {competitor.description}
                </p>

                <div className="pt-2 space-y-2 border-t border-border/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">
                        Total Funding
                      </p>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        {competitor.funding.total}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">
                        Latest Round
                      </p>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        {competitor.funding.lastRound}
                      </p>
                    </div>
                  </div>

                  {competitor.funding.recentActivity &&
                    competitor.funding.recentActivity !==
                      'Not publicly available' && (
                      <div>
                        <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">
                          Recent Activity
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {competitor.funding.recentActivity}
                        </p>
                      </div>
                    )}
                </div>

                <div className="flex justify-end pt-1">
                  <div className="w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-3.5 h-3.5 text-foreground/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}