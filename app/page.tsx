'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const IntelligenceGlobe = dynamic(
  () => import('@/components/intelligence-globe').then((mod) => mod.IntelligenceGlobe),
  { ssr: false }
)
import { AIActivityTimeline } from '@/components/ai-activity-timeline'
import { ResearchSection } from '@/components/research-section'
import { CompetitorsSection } from '@/components/competitors-section'
import { AnalysisSection } from '@/components/analysis-section'
import { InvestorReportSection } from '@/components/investor-report-section'
import { SourcesSection } from '@/components/sources-section'
import { BottomActionBar } from '@/components/bottom-action-bar'
import { generateInvestorMemo } from '@/lib/export-pdf'
import { Search, Loader2, Zap, Users, FileText } from 'lucide-react'

export default function Page() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [startupIdea, setStartupIdea] = useState('')
  const [completedSteps, setCompletedSteps] = useState<{
    research: boolean
    competitors: boolean
    analysis: boolean
    report: boolean
  }>({
    research: false,
    competitors: false,
    analysis: false,
    report: false,
  })
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [shareId, setShareId] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleAnalyze = async () => {
    if (!startupIdea.trim()) return
    setIsAnalyzing(true)
    setHasAnalyzed(true)
    setError(null)
    setCompletedSteps({
      research: false,
      competitors: false,
      analysis: false,
      report: false,
    })
    setAnalysisData(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupIdea }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to analyze startup idea')
      }

      setAnalysisData(json.data)
      setCompletedSteps({
        research: true,
        competitors: true,
        analysis: true,
        report: true,
      })
    } catch (err: any) {
      console.error('[Frontend] Analysis error:', err)
      setError(err.message || 'An error occurred during analysis.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartupIdea(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze()
    }
  }

  const resetWorkspace = () => {
    setHasAnalyzed(false)
    setStartupIdea('')
    setIsAnalyzing(false)
    setError(null)
    setAnalysisData(null)
    setShareId(null)
    setCompletedSteps({
      research: false,
      competitors: false,
      analysis: false,
      report: false,
    })
  }

  const handleShareReport = async () => {
    try {
      setIsSharing(true)
      let currentShareId = shareId
      
      if (!currentShareId) {
        const payload = {
          startupIdea,
          marketResearch: analysisData?.marketResearch,
          competitors: analysisData?.competitors,
          swot: analysisData?.swot,
          report: analysisData?.report,
          sources: analysisData?.sources
        }

        const res = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to generate share link')
        
        currentShareId = json.reportId
        setShareId(currentShareId)
      }

      const shareUrl = `${window.location.origin}/report/${currentShareId}`
      await navigator.clipboard.writeText(shareUrl)
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Venture Intel Report',
            text: `Check out this Venture Intel analysis for: ${startupIdea}`,
            url: shareUrl
          })
        } catch (e) {
          // ignore native share cancel
        }
      }
      
      showToast("Shareable report link copied")
    } catch (err) {
      console.error("Share failed:", err)
      showToast("Failed to share report")
    } finally {
      setIsSharing(false)
    }
  }

  const showActionBar =
  hasAnalyzed &&
  !isAnalyzing &&
  analysisData;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {!hasAnalyzed && <IntelligenceGlobe />}
      
      {/* Header */}
      <div className="border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Venture Intel</h1>
          </div>
        </div>
      </div>

      {/* Main Content - Single Page */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-out ${hasAnalyzed ? 'py-8' : 'py-24'} relative z-10`}>
        <div className={`w-full transition-all duration-500 ease-out ${hasAnalyzed ? 'max-w-6xl mx-auto px-8' : 'max-w-6xl mx-auto px-8 flex-1 flex items-center justify-center'}`}>
          {/* Input Section - Always visible */}
          <div className={`w-full transition-all duration-500 ease-out ${hasAnalyzed ? 'max-w-2xl mx-auto' : ''}`}>
            {!hasAnalyzed && (
              <div className="text-center space-y-8 mb-16">
                <div className="inline-block px-4 py-1.5 rounded-full bg-card border border-border/50 text-xs text-muted-foreground">
                  AI-Powered Research
                </div>
                <h2 className="text-6xl md:text-7xl font-bold text-balance leading-tight">
                  Analyze Any Startup Idea
                </h2>
                <p className="text-lg text-muted-foreground text-balance leading-relaxed max-w-lg mx-auto">
                  Get comprehensive research, competitive analysis, and investor-ready reports instantly
                </p>
              </div>
            )}

            {hasAnalyzed && (
              <div className="mb-8 animate-slide-down">
                <p className="text-sm text-muted-foreground mb-3">Analyzing</p>
                <h2 className="text-2xl font-semibold text-balance leading-tight">{startupIdea}</h2>
                {error && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Search Input */}
            <div className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Describe your startup idea..."
                  value={startupIdea}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={isAnalyzing || (hasAnalyzed && !completedSteps.report)}
                  className="w-full px-6 py-4 text-base rounded-lg text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>

              {/* Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (hasAnalyzed && !completedSteps.report) || !startupIdea.trim()}
                  className="flex-1 py-6 text-base font-medium bg-[#FAFAFA] text-black hover:bg-[#FAFAFA] hover:shadow-[0_12px_32px_rgba(255,255,255,0.15)] transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {(isAnalyzing || (hasAnalyzed && !completedSteps.report)) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:translate-x-1" />
                        Analyze Startup
                      </>
                    )}
                  </span>
                  {!(isAnalyzing || (hasAnalyzed && !completedSteps.report)) && (
                    <span className="absolute inset-0 opacity-0 group-active:animate-ripple pointer-events-none" />
                  )}
                </Button>
              </div>
            </div>

            {/* Analysis Sections - Progressive Reveal */}
            {hasAnalyzed && (
              <div className="mt-12 space-y-8 pb-24">
                {/* AI Activity Timeline - Always show while analyzing */}
                {isAnalyzing && <AIActivityTimeline isAnalyzing={isAnalyzing} />}

                {/* Research Section - Show only when complete */}
                {completedSteps.research && analysisData?.marketResearch && (
                  <div className="animate-slide-down">
                    <ResearchSection 
                      data={analysisData.marketResearch} 
                      sourceCount={analysisData.sources?.filter((s: any) => s.category === 'Research').length || 0} 
                    />
                  </div>
                )}

                {/* Competitors Section - Show only when complete */}
                {completedSteps.competitors && analysisData?.competitors && (
                  <div className="animate-slide-down">
                    <CompetitorsSection data={analysisData.competitors} />
                  </div>
                )}

                {/* Analysis Section - Show only when complete */}
                {completedSteps.analysis && analysisData?.swot && (
                  <div className="animate-slide-down">
                    <AnalysisSection data={analysisData.swot} />
                  </div>
                )}

                {/* Investor Report Section - Show only when complete */}
                {completedSteps.report && analysisData?.report && (
                  <div className="animate-slide-down">
                    <InvestorReportSection data={analysisData.report} />
                  </div>
                )}

                {/* Sources Section - Show at the end */}
                {completedSteps.report && analysisData?.sources && analysisData.sources.length > 0 && (
                  <div className="animate-slide-down">
                    <SourcesSection data={analysisData.sources} />
                  </div>
                )}
              </div>
            )}

            {/* AI Agent Cards - Only show when not analyzing */}
            {!hasAnalyzed && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
                <div className="p-4 rounded-lg border border-border/30 bg-card/20 hover:bg-card/50 hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(60,60,60,0.1)] hover:translate-y-[-2px] transition-all duration-300 ease-out cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Search className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Research Agent</p>
                      <p className="text-xs text-muted-foreground mt-1">Retrieves and validates sources</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-border/30 bg-card/20 hover:bg-card/50 hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(60,60,60,0.1)] hover:translate-y-[-2px] transition-all duration-300 ease-out cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Competitor Agent</p>
                      <p className="text-xs text-muted-foreground mt-1">Discovers similar companies and rivals</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-border/30 bg-card/20 hover:bg-card/50 hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(60,60,60,0.1)] hover:translate-y-[-2px] transition-all duration-300 ease-out cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Report Agent</p>
                      <p className="text-xs text-muted-foreground mt-1">Generates investor-ready recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {showActionBar && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <BottomActionBar
            onNewAnalysis={resetWorkspace}
            onExportPDF={() => generateInvestorMemo(startupIdea, analysisData)}
            onShareReport={handleShareReport}
          />
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium shadow-xl">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}
