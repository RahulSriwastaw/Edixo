import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { AppError } from '../../middleware/errorHandler';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface BulkEditRequest {
    question_ids: string[];
    edit_type: 'question_variation' | 'language_variation' | 'solution_add' | 'custom';
    action?: string;
    language?: string;
    custom_prompt?: string;
    ai_provider: 'gemini' | 'openai' | 'claude' | 'ollama';
    model: string;
}

interface EditLog {
    status: 'pending' | 'processing' | 'success' | 'error' | 'completed';
    question_id: string;
    index: number;
    total: number;
    message: string;
    error?: string;
}

// Utility for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper for AI calls with retry logic
async function callAIWithRetry(
    provider: string,
    systemPrompt: string,
    userPrompt: string,
    model: string,
    apiKey: string,
    maxRetries = 3
): Promise<string> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            switch (provider) {
                case 'gemini':
                    return await callGemini(systemPrompt, userPrompt, model, apiKey);
                case 'openai':
                    return await callOpenAI(systemPrompt, userPrompt, model, apiKey);
                case 'claude':
                    return await callClaude(systemPrompt, userPrompt, model, apiKey);
                default:
                    throw new Error(`Unsupported AI provider: ${provider}`);
            }
        } catch (error: any) {
            lastError = error;
            
            // Determine if the error is retryable
            // 429: Rate Limit
            // 500, 502, 503, 504: Transient Server Errors
            const status = error.response?.status || 
                          (error.message?.includes('429') ? 429 : 
                           error.message?.includes('503') ? 503 : 
                           error.message?.includes('500') ? 500 : 0);
            
            const isRetryable = status === 429 || status === 503 || status === 500 || status === 502 || status === 504;
            
            if (isRetryable && attempt < maxRetries) {
                const waitTime = attempt * 5000 + Math.random() * 2000; // Exponential backoff with jitter
                logger.warn(`AI ${provider} reported error ${status} on attempt ${attempt}. Waiting ${Math.round(waitTime/1000)}s before retry...`);
                await sleep(waitTime);
                continue;
            }
            throw error; 
        }
    }
    throw lastError;
}

// Utility for Prisma updates with retry (specifically for connection timeouts)
async function prismaUpdateWithRetry(questionId: string, updateData: any, maxRetries = 3) {
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await prisma.questions.update({
                where: { id: questionId },
                data: {
                    ...updateData
                }
            });
        } catch (error: any) {
            lastError = error;
            // P2024: Prisma connection pool timeout
            if (error.code === 'P2024' && attempt < maxRetries) {
                const waitTime = attempt * 3000;
                logger.warn(`Prisma connection pool timeout on attempt ${attempt} for question ${questionId}. Waiting ${waitTime/1000}s...`);
                await sleep(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

// Build AI system prompt based on edit type
function buildSystemPrompt(editType: string, action?: string, language?: string): string {
    const baseContext = `You are an expert educational content editor. Your task is to modify exam questions professionally while maintaining accuracy and clarity.`;

    switch (editType) {
        case 'question_variation':
            return `${baseContext}
Generate a meaningful variation of the given question that:
- Keeps the same concept and learning objective
- Maintains the same difficulty level
- Uses different context/scenario
- Has 4-5 options with only one correct answer
- Preserves mathematical/scientific accuracy

Return ONLY valid JSON: { "question_en": "...", "question_hi": "...", "options": [...], "correct_option": "A|B|C|D" }`;

        case 'language_variation':
            if (action === 'make_bilingual') {
                return `${baseContext}
Make this question bilingual by:
- Keeping the original English question and options
- Adding a complete Hindi translation alongside
- Ensuring translations are accurate and maintain meaning
- Using proper Hindi terminology for technical terms

Return JSON: { "question_en": "...", "question_hi": "...", "options": [{"text_en": "...", "text_hi": "..."}, ...] }`;
            } else if (action === 'translate_fully') {
                const targetLang = language || 'Hindi';
                return `${baseContext}
Translate this question fully to ${targetLang}:
- Translate question, options, and solution
- Maintain technical accuracy
- Use proper terminology in ${targetLang}
- Keep formatting and structure

Return JSON: { "question": "...", "options": [...], "solution": "..." }`;
            }
            return baseContext;

        case 'solution_add':
            if (action === 'add_solution_missing') {
                return `${baseContext}
Create a clear, step-by-step solution for this MCQ if missing:
- Explain why the correct option is right
- Briefly mention why other options are wrong
- Use mathematical/scientific reasoning
- Keep solution concise but comprehensive

Return JSON: { "solution_en": "...", "solution_hi": "..." }`;
            } else if (action === 'make_detailed') {
                return `${baseContext}
Expand the solution with more detailed explanation:
- Add step-by-step derivation/reasoning
- Explain concepts used
- Mention related topics
- Add visual descriptions if applicable

Return JSON: { "solution_en": "...", "solution_hi": "..." }`;
            } else if (action === 'make_crisp') {
                return `${baseContext}
Convert solution to bullet points format:
- Keep only essential steps
- Use bullet format
- Remove unnecessary elaboration
- Maintain clarity

Return JSON: { "solution_en": "...", "solution_hi": "..." }`;
            }
            return baseContext;

        default:
            return baseContext;
    }
}

// Build user prompt for a specific question
function buildUserPrompt(question: any, editType: string, customPrompt?: string): string {
    if (editType === 'custom') {
        return `${customPrompt}

QUESTION DATA:
Title: ${question.text_en || question.text_hi}
Options: ${question.question_options?.map((o: any) => `${o.is_correct ? '[CORRECT] ' : ''}${o.text_en || o.text_hi}`).join('; ')}
Current Solution: ${question.explanation_en || question.explanation_hi || 'Not provided'}`;
    }

    return `QUESTION TO PROCESS:
Title: ${question.text_en || question.text_hi}
Options: ${question.question_options?.map((o: any) => `${o.is_correct ? '[CORRECT] ' : ''}${o.text_en || o.text_hi}`).join('; ')}
Current Solution: ${question.explanation_en || question.explanation_hi || 'Not provided'}`;
}

// Call Gemini API
async function callGemini(systemPrompt: string, userPrompt: string, model: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });

    const result = await genModel.generateContent([
        { text: systemPrompt + "\n\n" + userPrompt }
    ]);

    return result.response.text();
}

// Call OpenAI API
async function callOpenAI(systemPrompt: string, userPrompt: string, model: string, apiKey: string): Promise<string> {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
    }, {
        headers: { Authorization: `Bearer ${apiKey}` }
    });

    return response.data.choices[0].message.content;
}

// Call Claude API
async function callClaude(systemPrompt: string, userPrompt: string, model: string, apiKey: string): Promise<string> {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
    }, {
        headers: { 'X-API-Key': apiKey, 'anthropic-version': '2023-06-01' }
    });

    return response.data.content[0].type === 'text' ? response.data.content[0].text : '';
}

// Main bulk edit controller with SSE streaming
export const bulkAIEditController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: BulkEditRequest = req.body;
        
        // Validate required fields
        if (!body.question_ids || body.question_ids.length === 0) {
            throw new AppError('No questions selected', 400);
        }
        if (!body.edit_type || !body.ai_provider || !body.model) {
            throw new AppError('Missing required fields: edit_type, ai_provider, model', 400);
        }

        // Get API key based on provider
        let apiKey = '';
        switch (body.ai_provider) {
            case 'gemini':
                apiKey = process.env.GEMINI_API_KEY || '';
                break;
            case 'openai':
                apiKey = process.env.OPENAI_API_KEY || '';
                break;
            case 'claude':
                apiKey = process.env.CLAUDE_API_KEY || '';
                break;
            default:
                throw new AppError('Unsupported AI provider', 400);
        }

        if (!apiKey) {
            throw new AppError(`API key for ${body.ai_provider} not configured`, 500);
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Accel-Buffering', 'no');

        const total = body.question_ids.length;
        let successCount = 0;
        let errorCount = 0;

        // Send initial status
        const sendLog = (log: EditLog) => {
            res.write(`data: ${JSON.stringify(log)}\n\n`);
            // Flush to bypass any compression/middleware buffering
            if (typeof (res as any).flush === 'function') {
                (res as any).flush();
            }
        };

        sendLog({
            status: 'pending',
            question_id: '',
            index: 0,
            total,
            message: `Preparing to process ${total} questions...`
        });

        // Fetch all questions with options
        const questions = await prisma.questions.findMany({
            where: { id: { in: body.question_ids } },
            include: { question_options: true }
        });

        if (questions.length === 0) {
            throw new AppError('No questions found', 404);
        }

        // Build prompts
        const systemPrompt = buildSystemPrompt(body.edit_type, body.action, body.language);

        // Process each question
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const index = i + 1;

            try {
                sendLog({
                    status: 'processing',
                    question_id: question.id,
                    index,
                    total,
                    message: `Processing question ${index}/${total}: "${question.text_en?.substring(0, 50)}..."`
                });

                const userPrompt = buildUserPrompt(question, body.edit_type, body.custom_prompt);

                // Call AI with retry logic
                const aiResponse = await callAIWithRetry(
                    body.ai_provider,
                    systemPrompt,
                    userPrompt,
                    body.model,
                    apiKey
                );

                // Parse JSON from response (handle markdown code blocks)
                let parsedResponse: any = {};
                try {
                    const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    parsedResponse = JSON.parse(cleanedResponse);
                } catch (parseError) {
                    throw new Error(`Failed to parse AI response: ${aiResponse.substring(0, 100)}`);
                }

                // Update question based on edit type
                let updateData: any = {};
                if (body.edit_type === 'question_variation') {
                    updateData = {
                        text_en: parsedResponse.question_en || question.text_en,
                        text_hi: parsedResponse.question_hi || question.text_hi
                    };
                } else if (body.edit_type === 'solution_add') {
                    updateData = {
                        explanation_en: parsedResponse.solution_en || parsedResponse.solution || question.explanation_en,
                        explanation_hi: parsedResponse.solution_hi || question.explanation_hi
                    };
                } else if (body.edit_type === 'language_variation' && body.action === 'make_bilingual') {
                    updateData = {
                        text_en: parsedResponse.question_en || question.text_en,
                        text_hi: parsedResponse.question_hi || question.text_hi
                    };
                } else if (body.edit_type === 'custom') {
                    // For custom prompts, update based on what AI returns
                    updateData = {
                        ...parsedResponse
                    };
                }

                // Save to database with retry
                await prismaUpdateWithRetry(question.id, updateData);

                successCount++;
                sendLog({
                    status: 'success',
                    question_id: question.id,
                    index,
                    total,
                    message: `✓ Question ${index} updated successfully`
                });

                // Add a small delay between questions to avoid burst limits
                if (i < questions.length - 1) {
                    await sleep(1000); // 1-second delay
                }

            } catch (error: any) {
                errorCount++;
                sendLog({
                    status: 'error',
                    question_id: question.id,
                    index,
                    total,
                    message: `✗ Question ${index} failed`,
                    error: error.message
                });
                logger.error(`Bulk AI Edit error for question ${question.id}:`, error.message);
            }
        }

        // Send completion status
        sendLog({
            status: 'completed',
            question_id: '',
            index: total,
            total,
            message: `✓ ${successCount} questions updated successfully | ✗ ${errorCount} failed`
        });

        res.end();

    } catch (error: any) {
        logger.error('Bulk AI Edit Controller error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Bulk AI edit failed'
        });
    }
};
