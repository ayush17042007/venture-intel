'use client'

import { useState } from 'react'
import { ChevronDown, Link as LinkIcon, Globe, BookOpen } from 'lucide-react'

interface Source {
  url: string;
  title: string;
  category: 'Research' | 'Competitor';
}

export function SourcesSection({ data }: { data?: Source[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data || data.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-foreground" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold">Sources</h3>
            <p className="text-sm text-muted-foreground">{data.length} references aggregated</p>
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
        <div className="space-y-3 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {data.map((source, index) => (
            <a
              key={`${source.url}-${index}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-lg border border-border/30 bg-card/20 hover:bg-card/40 transition-colors"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    {source.category === 'Research' ? (
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{source.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{source.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 px-2 py-1 rounded bg-foreground/5">
                    {source.category}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-3.5 h-3.5 text-foreground/40 transform -rotate-45"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
