import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Bilingual question types matching the PRD schema
interface BilingualQuestion {
  id: string;
  question_hin: string;
  question_eng: string;
  option1_hin: string;
  option1_eng: string;
  option2_hin: string;
  option2_eng: string;
  option3_hin: string;
  option3_eng: string;
  option4_hin: string;
  option4_eng: string;
  option5_hin?: string;
  option5_eng?: string;
  answer: string;
  solution_hin: string;
  solution_eng: string;
  question_type: 'mcq' | 'integer' | 'multi_select' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  chapter: string;
  topic?: string;
  related_exam?: string;
  source_type: 'ai_generated';
  language: 'bilingual';
}

interface PromptGenerateRequest {
  prompt: string;
  questionType: 'MCQ' | 'Integer' | 'Multi-select' | 'True-False';
  questionCount: number;
  language: 'English' | 'Hindi' | 'Hinglish';
  bilingual?: boolean;
  subject?: string;
  chapter?: string;
  difficulty?: string;
}

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

function generateQuestionId(): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `Q-${num}`;
}

// Extract JSON from text
function extractJsonArray(text: string): string | null {
  const patterns = [
    /\[[\s\S]*?\](?=\s*$)/,
    /\[[\s\S]*?\](?=\s*```)/,
    /```json\s*([\s\S]*?)```/,
    /```\s*([\s\S]*?)```/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let extracted = match[1] || match[0];
      extracted = extracted.trim();
      if (extracted.startsWith('[') && extracted.endsWith(']')) {
        return extracted;
      }
    }
  }

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return null;
}

// Generate fallback bilingual questions
function generateFallbackBilingualQuestions(prompt: string, count: number, type: string, subject: string, chapter: string): BilingualQuestion[] {
  const questions: BilingualQuestion[] = [];
  const topics = ['Basics', 'Fundamentals', 'Applications', 'Advanced'];
  
  for (let i = 0; i < count; i++) {
    const qNum = i + 1;
    const diff: 'easy' | 'medium' | 'hard' = ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard';
    
    questions.push({
      id: generateQuestionId(),
      question_hin: `<p>${prompt} पर प्रश्न ${qNum}। यह एक AI उत्पन्न प्रश्न है।</p>`,
      question_eng: `<p>Question ${qNum} about ${prompt}. This is an AI generated question.</p>`,
      option1_hin: '<p>विकल्प अ</p>',
      option1_eng: '<p>Option A</p>',
      option2_hin: '<p>विकल्प ब</p>',
      option2_eng: '<p>Option B</p>',
      option3_hin: '<p>विकल्प स</p>',
      option3_eng: '<p>Option C</p>',
      option4_hin: '<p>विकल्प द</p>',
      option4_eng: '<p>Option D</p>',
      answer: ['A', 'B', 'C', 'D'][i % 4],
      solution_hin: `<p>यह ${['A', 'B', 'C', 'D'][i % 4]} का स्पष्टीकरण है। ${prompt} से संबंधित।</p>`,
      solution_eng: `<p>This is the explanation for option ${['A', 'B', 'C', 'D'][i % 4]}. Related to ${prompt}.</p>`,
      question_type: type === 'Integer' ? 'integer' : type === 'Multi-select' ? 'multi_select' : type === 'True-False' ? 'true_false' : 'mcq',
      difficulty: diff,
      subject: subject || 'General',
      chapter: chapter || 'General',
      topic: topics[i % topics.length],
      source_type: 'ai_generated',
      language: 'bilingual',
    });
  }
  return questions;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!body.prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    return await handleBilingualGeneration(body as PromptGenerateRequest);
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate questions' 
      },
      { status: 500 }
    );
  }
}

async function handleBilingualGeneration(body: PromptGenerateRequest) {
  const { prompt, questionType, questionCount, subject, chapter, difficulty } = body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json(
      { success: false, error: 'Prompt is required' },
      { status: 400 }
    );
  }

  const count = Math.min(Math.max(1, parseInt(String(questionCount)) || 5), 25);
  const qType = ['MCQ', 'Integer', 'Multi-select', 'True-False'].includes(questionType) 
    ? questionType 
    : 'MCQ';
  const qTypeApi = qType === 'Integer' ? 'integer' : qType === 'Multi-select' ? 'multi_select' : qType === 'True-False' ? 'true_false' : 'mcq';

  try {
    const zai = await getZAI();

    // Build prompt for bilingual questions
    const systemPrompt = `You are an expert bilingual question generator for Indian competitive exams (JEE, NEET, UPSC). Generate questions in BOTH Hindi and English.

CRITICAL RULES:
1. Every question MUST have both Hindi (question_hin) and English (question_eng) versions
2. All options MUST have both Hindi (optionN_hin) and English (optionN_eng) versions
3. Solutions MUST have both Hindi (solution_hin) and English (solution_eng) versions
4. Use HTML format: <p>text</p> for paragraphs
5. Use LaTeX for math: \\(inline\\) for inline, \\[display\\] for display
6. Use <sub> and <sup> for chemical formulas: H<sub>2</sub>O, x<sup>2</sup>
7. Answer must be a single letter: A, B, C, or D
8. Difficulty must be: easy, medium, or hard
9. Return ONLY valid JSON array, no markdown or explanation`;

    const userMessage = `Generate exactly ${count} ${qType} questions about: ${prompt}
${subject ? `Subject: ${subject}` : ''}
${chapter ? `Chapter: ${chapter}` : ''}
${difficulty ? `Difficulty: ${difficulty}` : ''}

Return ONLY a JSON array with this EXACT structure for each question:
[{
  "question_hin": "<p>Hindi question text here...</p>",
  "question_eng": "<p>English question text here...</p>",
  "option1_hin": "<p>Hindi option A</p>",
  "option1_eng": "<p>English option A</p>",
  "option2_hin": "<p>Hindi option B</p>",
  "option2_eng": "<p>English option B</p>",
  "option3_hin": "<p>Hindi option C</p>",
  "option3_eng": "<p>English option C</p>",
  "option4_hin": "<p>Hindi option D</p>",
  "option4_eng": "<p>English option D</p>",
  "answer": "B",
  "solution_hin": "<p>Hindi explanation...</p>",
  "solution_eng": "<p>English explanation...</p>",
  "difficulty": "medium",
  "subject": "${subject || 'Topic'}",
  "chapter": "${chapter || 'Chapter'}"
}]`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      thinking: { type: 'disabled' }
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      console.log('Empty AI response, using fallback');
      return NextResponse.json({
        success: true,
        questions: generateFallbackBilingualQuestions(prompt, count, qTypeApi, subject || '', chapter || ''),
        count: count,
        fallback: true,
      });
    }

    console.log('AI Response length:', responseContent.length);

    // Try to parse JSON
    let questions: any[] = [];
    let parsed = false;

    // Method 1: Direct parse
    try {
      questions = JSON.parse(responseContent.trim());
      parsed = true;
    } catch (e) {
      console.log('Direct parse failed');
    }

    // Method 2: Extract JSON array
    if (!parsed) {
      const extracted = extractJsonArray(responseContent);
      if (extracted) {
        try {
          questions = JSON.parse(extracted);
          parsed = true;
        } catch (e) {
          console.log('Extracted parse failed');
        }
      }
    }

    // Method 3: Clean and parse
    if (!parsed) {
      let cleaned = responseContent.trim();
      cleaned = cleaned.replace(/```json\s*/gi, '');
      cleaned = cleaned.replace(/```\s*/gi, '');
      cleaned = cleaned.trim();
      
      const start = cleaned.indexOf('[');
      const end = cleaned.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.slice(start, end + 1);
        try {
          questions = JSON.parse(cleaned);
          parsed = true;
        } catch (e) {
          console.log('Clean parse failed');
        }
      }
    }

    // If parsing failed, use fallback
    if (!parsed || !Array.isArray(questions) || questions.length === 0) {
      console.log('All parsing failed, using fallback questions');
      return NextResponse.json({
        success: true,
        questions: generateFallbackBilingualQuestions(prompt, count, qTypeApi, subject || '', chapter || ''),
        count: count,
        fallback: true,
      });
    }

    // Process and validate questions
    const processedQuestions: BilingualQuestion[] = questions.slice(0, count).map((q, index) => {
      const diff: 'easy' | 'medium' | 'hard' = ['easy', 'medium', 'hard'].includes(q.difficulty?.toLowerCase()) 
        ? q.difficulty.toLowerCase() 
        : 'medium';
      
      return {
        id: generateQuestionId(),
        question_hin: String(q.question_hin || `<p>प्रश्न ${index + 1}</p>`),
        question_eng: String(q.question_eng || `<p>Question ${index + 1}</p>`),
        option1_hin: String(q.option1_hin || '<p>विकल्प अ</p>'),
        option1_eng: String(q.option1_eng || '<p>Option A</p>'),
        option2_hin: String(q.option2_hin || '<p>विकल्प ब</p>'),
        option2_eng: String(q.option2_eng || '<p>Option B</p>'),
        option3_hin: String(q.option3_hin || '<p>विकल्प स</p>'),
        option3_eng: String(q.option3_eng || '<p>Option C</p>'),
        option4_hin: String(q.option4_hin || '<p>विकल्प द</p>'),
        option4_eng: String(q.option4_eng || '<p>Option D</p>'),
        option5_hin: q.option5_hin ? String(q.option5_hin) : undefined,
        option5_eng: q.option5_eng ? String(q.option5_eng) : undefined,
        answer: ['A', 'B', 'C', 'D', 'E'].includes(String(q.answer).toUpperCase()) 
          ? String(q.answer).toUpperCase() 
          : 'A',
        solution_hin: String(q.solution_hin || '<p>स्पष्टीकरण उपलब्ध नहीं है।</p>'),
        solution_eng: String(q.solution_eng || '<p>Explanation not available.</p>'),
        question_type: qTypeApi,
        difficulty: diff,
        subject: String(q.subject || subject || 'General'),
        chapter: String(q.chapter || chapter || 'General'),
        topic: q.topic ? String(q.topic) : undefined,
        source_type: 'ai_generated',
        language: 'bilingual',
      };
    });

    return NextResponse.json({
      success: true,
      questions: processedQuestions,
      count: processedQuestions.length,
    });

  } catch (error) {
    console.error('Generation error:', error);
    
    // Return fallback questions
    return NextResponse.json({
      success: true,
      questions: generateFallbackBilingualQuestions(prompt, count, qTypeApi, subject || '', chapter || ''),
      count: count,
      fallback: true,
    });
  }
}
