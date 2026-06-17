import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateShortId() {
  return Math.random().toString(36).substring(2, 11);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startupIdea, marketResearch, competitors, swot, report, sources } = body;

    if (!startupIdea) {
      return NextResponse.json({ error: 'Missing startupIdea' }, { status: 400 });
    }

    // Generate a unique short ID for the report
    const id = generateShortId();

    // Insert into Supabase
    const { error } = await supabase
      .from('reports')
      .insert({
        id,
        startup_idea: startupIdea,
        market_research: marketResearch,
        competitors,
        swot,
        report,
        sources,
      });

    if (error) {
      console.error('[API Share] Supabase insertion error:', error);
      throw error;
    }

    return NextResponse.json({
      reportId: id,
      shareUrl: `/report/${id}`
    });
  } catch (error: any) {
    console.error('[API Share] Error generating share link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
