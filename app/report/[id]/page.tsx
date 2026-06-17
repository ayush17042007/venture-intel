import { supabase } from '@/lib/supabase'
import { ResearchSection } from '@/components/research-section'
import { CompetitorsSection } from '@/components/competitors-section'
import { AnalysisSection } from '@/components/analysis-section'
import { InvestorReportSection } from '@/components/investor-report-section'
import { SourcesSection } from '@/components/sources-section'
import { Zap, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">Report Not Found</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            The shareable report link you are trying to access is invalid or has expired.
          </p>
          <Link href="/">
            <button className="mt-8 px-6 py-3 bg-[#FAFAFA] text-black font-medium rounded-lg hover:shadow-[0_12px_32px_rgba(255,255,255,0.15)] transition-all">
              Start New Analysis
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse the report data
  const analysisData = {
    marketResearch: report.market_research,
    competitors: report.competitors,
    swot: report.swot,
    report: report.report,
    sources: report.sources,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Venture Intel</h1>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col py-8 relative z-10">
        <div className="w-full max-w-6xl mx-auto px-8">
          
          <div className="mb-12 animate-slide-down max-w-2xl mx-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-card border border-border/50 text-xs text-muted-foreground mb-6">
              Shared Intelligence Report
            </div>
            <p className="text-sm text-muted-foreground mb-3">Analyzing</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-balance leading-tight">{report.startup_idea}</h2>
            <p className="text-xs text-muted-foreground mt-4">Generated on {new Date(report.created_at).toLocaleDateString()}</p>
          </div>

          {/* Analysis Sections */}
          <div className="space-y-8 pb-24 max-w-2xl mx-auto">
            {analysisData.marketResearch && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <ResearchSection 
                  data={analysisData.marketResearch} 
                  sourceCount={analysisData.sources?.filter((s: any) => s.category === 'Research').length || 0} 
                />
              </div>
            )}

            {analysisData.competitors && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                <CompetitorsSection data={analysisData.competitors} />
              </div>
            )}

            {analysisData.swot && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                <AnalysisSection data={analysisData.swot} />
              </div>
            )}

            {analysisData.report && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
                <InvestorReportSection data={analysisData.report} />
              </div>
            )}

            {analysisData.sources && analysisData.sources.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
                <SourcesSection data={analysisData.sources} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
