import { NextRequest, NextResponse } from 'next/server';
import { runAnalysis } from '@/lib/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startupIdea } = body;

    if (!startupIdea || typeof startupIdea !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid startupIdea in request body' },
        { status: 400 }
      );
    }

    // Run the LangGraph orchestration
    console.log(`[API] Received analysis request for: ${startupIdea}`);
    const finalState = await runAnalysis(startupIdea);

    const { marketResearch, competitors, swot, report, sources } = finalState;

    console.log('[Research]', JSON.stringify(marketResearch, null, 2));
    console.log('[Competitors]', JSON.stringify(competitors, null, 2));
    console.log('[SWOT]', JSON.stringify(swot, null, 2));
    console.log('[Report]', JSON.stringify(report, null, 2));
    console.log('[Sources]', JSON.stringify(sources, null, 2));

    return NextResponse.json({
      success: true,
      data: { marketResearch, competitors, swot, report, sources },
    });
  } catch (error: any) {
    console.error('[API] Error during analysis:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
