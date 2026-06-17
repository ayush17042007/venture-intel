'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface TimelineEvent {
  id: string
  label: string
  completed: boolean
  order: number
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'plan', label: 'Research plan generated', completed: false, order: 1 },
  { id: 'sources', label: 'Retrieved 124 sources', completed: false, order: 2 },
  { id: 'trends', label: 'Analyzed market trends', completed: false, order: 3 },
  { id: 'competitors', label: 'Identified competitors', completed: false, order: 4 },
  { id: 'assessment', label: 'Generated investment assessment', completed: false, order: 5 },
]

interface AIActivityTimelineProps {
  isAnalyzing: boolean
}

export function AIActivityTimeline({ isAnalyzing }: AIActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(TIMELINE_EVENTS)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setEvents(TIMELINE_EVENTS)
      setCompletedCount(0)
      return
    }

    // Stagger event completion
    const intervals: NodeJS.Timeout[] = []
    const timings = [400, 1000, 1400, 1800, 2200]

    timings.forEach((timing, index) => {
      const interval = setTimeout(() => {
        setEvents((prev) =>
          prev.map((event) =>
            event.order === index + 1 ? { ...event, completed: true } : event,
          ),
        )
        setCompletedCount(index + 1)
      }, timing)
      intervals.push(interval)
    })

    return () => {
      intervals.forEach((interval) => clearTimeout(interval))
    }
  }, [isAnalyzing])

  if (!isAnalyzing) return null

  const progressPercentage = (completedCount / TIMELINE_EVENTS.length) * 100

  return (
    <div className="w-full space-y-6 py-8 px-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Intelligence Workflow</h3>
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-foreground animate-spin" />
          <span className="text-xs text-muted-foreground">
            {completedCount} of {TIMELINE_EVENTS.length} steps completed
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-card rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Timeline Events */}
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={event.id} className="flex items-start gap-4">
            {/* Timeline Connector */}
            <div className="relative flex flex-col items-center">
              {/* Dot */}
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  event.completed ? 'bg-foreground scale-125' : 'bg-border/50'
                }`}
              />
              {/* Connector Line */}
              {index < events.length - 1 && (
                <div
                  className={`w-0.5 h-6 transition-colors duration-500 ${
                    event.completed ? 'bg-foreground/30' : 'bg-border/20'
                  }`}
                />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 py-1">
              <div className="flex items-center gap-2">
                {event.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-foreground flex-shrink-0 animate-in fade-in zoom-in duration-300" />
                    <span
                      className={`text-sm transition-colors duration-500 ${
                        event.completed ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {event.label}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full border border-border/50 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground/60">{event.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
