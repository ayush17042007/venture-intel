import { Download, Share2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BottomActionBarProps {
  onNewAnalysis: () => void
  onExportPDF: () => void
  onShareReport: () => void
}

export function BottomActionBar({
  onNewAnalysis,
  onExportPDF,
  onShareReport,
}: BottomActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 backdrop-blur-md z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-3">
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card hover:bg-card/80 hover:border-accent/40 hover:shadow-[0_4px_12px_rgba(60,60,60,0.1)] hover:translate-y-[-2px] text-foreground transition-all duration-200 ease-out border border-border/50 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export PDF</span>
        </button>
        
        <button
          onClick={onShareReport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card hover:bg-card/80 hover:border-accent/40 hover:shadow-[0_4px_12px_rgba(60,60,60,0.1)] hover:translate-y-[-2px] text-foreground transition-all duration-200 ease-out border border-border/50 active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share Report</span>
        </button>
        
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-200 hover:shadow-[0_8px_24px_rgba(255,255,255,0.08)] hover:scale-[1.02] text-accent-foreground transition-all duration-200 ease-out font-medium active:scale-95"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span className="text-sm font-medium">New Analysis</span>
        </button>
      </div>
    </div>
  )
}
