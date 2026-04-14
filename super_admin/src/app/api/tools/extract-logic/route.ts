import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, config } = body;

    if (action === 'ai-generate') {
      const zai = await getZAI();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'user', content: prompt }
        ],
        thinking: { type: 'disabled' }
      });
      
      return NextResponse.json({ 
        text: completion.choices[0]?.message?.content || "" 
      });
    }

    if (action === 'proofread-mcqs') {
      const zai = await getZAI();
      const systemPrompt = `You are an expert Exam Paper Editor. Extract all MCQs from the provided text into a JSON array.
      Format: [{"questionText": "...", "options": [{"label": "A", "text": "..."}, ...]}]`;
      
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        thinking: { type: 'disabled' }
      });

      const content = completion.choices[0]?.message?.content || "[]";
      // Clean potential markdown
      const cleanJson = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      
      try {
        const questions = JSON.parse(cleanJson);
        return NextResponse.json({ questions });
      } catch (e) {
        return NextResponse.json({ error: "Failed to parse AI response", raw: content }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error('Tools API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
