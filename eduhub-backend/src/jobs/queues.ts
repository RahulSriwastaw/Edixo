import { Queue, Worker, QueueEvents } from 'bullmq';
import { logger } from '../config/logger';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Lazy Queue/Worker Instances (created only after Redis connects) ───
let _pdfExtractQueue: Queue | null = null;
let _masteryUpdateQueue: Queue | null = null;
let _folderCountQueue: Queue | null = null;
let _notificationQueue: Queue | null = null;
let _receiptQueue: Queue | null = null;
let _testScheduleQueue: Queue | null = null;
let _bulkAIEditQueue: Queue | null = null;

// Export getters so existing code can import these names
export function getPdfExtractQueue() { return _pdfExtractQueue; }
export function getMasteryUpdateQueue() { return _masteryUpdateQueue; }
export function getFolderCountQueue() { return _folderCountQueue; }
export function getNotificationQueue() { return _notificationQueue; }
export function getReceiptQueue() { return _receiptQueue; }
export function getTestScheduleQueue() { return _testScheduleQueue; }

// bulkAIEditQueue is used directly by controllers — keep a named export that can be null
export { _bulkAIEditQueue as bulkAIEditQueue };

// ─── Bulk AI Edit Background Worker ──────────────────────────

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(systemPrompt: string, userPrompt: string, model: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    const result = await genModel.generateContent([{ text: systemPrompt + "\n\n" + userPrompt }]);
    return result.response.text();
}

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
                case 'gemini': return await callGemini(systemPrompt, userPrompt, model, apiKey);
                case 'openai': return await callOpenAI(systemPrompt, userPrompt, model, apiKey);
                case 'claude': return await callClaude(systemPrompt, userPrompt, model, apiKey);
                default: throw new Error(`Unsupported AI provider: ${provider}`);
            }
        } catch (error: any) {
            lastError = error;
            const status = error.response?.status ||
                (error.message?.includes('429') ? 429 :
                 error.message?.includes('503') ? 503 :
                 error.message?.includes('500') ? 500 : 0);
            const isRetryable = status === 429 || status === 503 || status === 500 || status === 502 || status === 504;
            if (isRetryable && attempt < maxRetries) {
                const waitTime = attempt * 5000 + Math.random() * 2000;
                logger.warn(`AI ${provider} reported error ${status} on attempt ${attempt}. Waiting ${Math.round(waitTime/1000)}s before retry...`);
                await sleep(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

async function prismaUpdateWithRetry(questionId: string, updateData: any, maxRetries = 3) {
    const { prisma } = await import('../config/database');
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await prisma.questions.update({
                where: { id: questionId },
                data: { ...updateData }
            });
        } catch (error: any) {
            lastError = error;
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

function buildSystemPrompt(editType: string, action?: string, language?: string): string {
    const baseContext = `You are an expert educational content editor. Your task is to modify exam questions professionally while maintaining accuracy and clarity.`;
    switch (editType) {
        case 'question_variation':
            return `${baseContext}\nGenerate a meaningful variation of the given question that:\n- Keeps the same concept and learning objective\n- Maintains the same difficulty level\n- Uses different context/scenario\n- Has 4-5 options with only one correct answer\n- Preserves mathematical/scientific accuracy\n\nReturn ONLY valid JSON: { "question_en": "...", "question_hi": "...", "options": [...], "correct_option": "A|B|C|D" }`;
        case 'language_variation':
            if (action === 'make_bilingual') {
                return `${baseContext}\nMake this question bilingual by:\n- Keeping the original English question and options\n- Adding a complete Hindi translation alongside\n- Ensuring translations are accurate and maintain meaning\n- Using proper Hindi terminology for technical terms\n\nReturn JSON: { "question_en": "...", "question_hi": "...", "options": [{"text_en": "...", "text_hi": "..."}, ...] }`;
            } else if (action === 'translate_fully') {
                const targetLang = language || 'Hindi';
                return `${baseContext}\nTranslate this question fully to ${targetLang}:\n- Translate question, options, and solution\n- Maintain technical accuracy\n- Use proper terminology in ${targetLang}\n- Keep formatting and structure\n\nReturn JSON: { "question": "...", "options": [...], "solution": "..." }`;
            }
            return baseContext;
        case 'solution_add':
            if (action === 'add_solution_missing') {
                return `${baseContext}\nCreate a clear, step-by-step solution for this MCQ if missing:\n- Explain why the correct option is right\n- Briefly mention why other options are wrong\n- Use mathematical/scientific reasoning\n- Keep solution concise but comprehensive\n\nReturn JSON: { "solution_en": "...", "solution_hi": "..." }`;
            } else if (action === 'make_detailed') {
                return `${baseContext}\nExpand the solution with more detailed explanation:\n- Add step-by-step derivation/reasoning\n- Explain concepts used\n- Mention related topics\n- Add visual descriptions if applicable\n\nReturn JSON: { "solution_en": "...", "solution_hi": "..." }`;
            } else if (action === 'make_crisp') {
                return `${baseContext}\nConvert solution to bullet points format:\n- Keep only essential steps\n- Use bullet format\n- Remove unnecessary elaboration\n- Maintain clarity\n\nReturn JSON: { "solution_en": "...", "solution_hi": "..." }`;
            }
            return baseContext;
        default:
            return baseContext;
    }
}

function buildUserPrompt(question: any, editType: string, customPrompt?: string): string {
    if (editType === 'custom') {
        return `${customPrompt}\n\nQUESTION DATA:\nTitle: ${question.text_en || question.text_hi}\nOptions: ${question.question_options?.map((o: any) => `${o.is_correct ? '[CORRECT] ' : ''}${o.text_en || o.text_hi}`).join('; ')}\nCurrent Solution: ${question.explanation_en || question.explanation_hi || 'Not provided'}`;
    }
    return `QUESTION TO PROCESS:\nTitle: ${question.text_en || question.text_hi}\nOptions: ${question.question_options?.map((o: any) => `${o.is_correct ? '[CORRECT] ' : ''}${o.text_en || o.text_hi}`).join('; ')}\nCurrent Solution: ${question.explanation_en || question.explanation_hi || 'Not provided'}`;
}

export let bulkAIEditWorker: Worker | null = null;
export let masteryUpdateWorker: Worker | null = null;
export let notificationWorker: Worker | null = null;

// ─── Initialize all queues and workers (call AFTER Redis connects) ───
export function initQueues(redisConnection?: any) {
    // Use passed connection or try dynamic require as fallback
    const connection = redisConnection || require('../config/redis').redis;
    if (!connection) {
        logger.warn('⚠️ Redis not available — BullMQ queues will NOT be initialized');
        return;
    }

    // Create Queues
    _pdfExtractQueue = new Queue('pdfExtract', { connection: connection as any });
    _masteryUpdateQueue = new Queue('masteryUpdate', { connection: connection as any });
    _folderCountQueue = new Queue('folderCount', { connection: connection as any });
    _notificationQueue = new Queue('notification', { connection: connection as any });
    _receiptQueue = new Queue('receipt', { connection: connection as any });
    _testScheduleQueue = new Queue('testSchedule', { connection: connection as any });
    _bulkAIEditQueue = new Queue('bulkAIEdit', { connection: connection as any });

    // ─── Bulk AI Edit Worker ──────────────────────────
    bulkAIEditWorker = new Worker(
        'bulkAIEdit',
        async (job) => {
            const { prisma } = await import('../config/database');
            const {
                question_ids,
                edit_type,
                action,
                language,
                custom_prompt,
                ai_provider,
                model,
                apiKey,
                isRetry = false,
                originalFailedIds = []
            } = job.data;

            const total = question_ids.length;
            let successCount = 0;
            let errorCount = 0;
            const failedQuestionIds: string[] = [];
            const logs: any[] = [];

            const addLog = (log: any) => {
                logs.push(log);
                job.updateProgress({ logs, successCount, errorCount, failedQuestionIds, progress: Math.round(((successCount + errorCount) / total) * 100) });
            };

            addLog({ status: 'pending', question_id: '', index: 0, total, message: `Preparing to process ${total} questions...` });

            const questions = await prisma.questions.findMany({
                where: { id: { in: question_ids } },
                include: { question_options: true }
            });

            if (questions.length === 0) {
                throw new Error('No questions found');
            }

            const systemPrompt = buildSystemPrompt(edit_type, action, language);

            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                const index = i + 1;

                try {
                    addLog({
                        status: 'processing',
                        question_id: question.id,
                        index,
                        total,
                        message: `Processing question ${index}/${total}: "${question.text_en?.substring(0, 50)}..."`
                    });

                    const userPrompt = buildUserPrompt(question, edit_type, custom_prompt);
                    const aiResponse = await callAIWithRetry(ai_provider, systemPrompt, userPrompt, model, apiKey);

                    let parsedResponse: any = {};
                    try {
                        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                        parsedResponse = JSON.parse(cleanedResponse);
                    } catch (parseError) {
                        throw new Error(`Failed to parse AI response: ${aiResponse.substring(0, 100)}`);
                    }

                    let updateData: any = {};
                    if (edit_type === 'question_variation') {
                        updateData = {
                            text_en: parsedResponse.question_en || question.text_en,
                            text_hi: parsedResponse.question_hi || question.text_hi
                        };
                    } else if (edit_type === 'solution_add') {
                        updateData = {
                            explanation_en: parsedResponse.solution_en || parsedResponse.solution || question.explanation_en,
                            explanation_hi: parsedResponse.solution_hi || question.explanation_hi
                        };
                    } else if (edit_type === 'language_variation' && action === 'make_bilingual') {
                        updateData = {
                            text_en: parsedResponse.question_en || question.text_en,
                            text_hi: parsedResponse.question_hi || question.text_hi
                        };
                    } else if (edit_type === 'custom') {
                        updateData = { ...parsedResponse };
                    }

                    await prismaUpdateWithRetry(question.id, updateData);

                    successCount++;
                    addLog({
                        status: 'success',
                        question_id: question.id,
                        index,
                        total,
                        message: `✓ Question ${index} updated successfully`
                    });

                    if (i < questions.length - 1) {
                        await sleep(1000);
                    }
                } catch (error: any) {
                    errorCount++;
                    failedQuestionIds.push(question.id);
                    addLog({
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

            addLog({
                status: 'completed',
                question_id: '',
                index: total,
                total,
                message: `✓ ${successCount} questions updated successfully | ✗ ${errorCount} failed`
            });

            // Store final result in job data for retrieval
            await job.updateData({
                ...job.data,
                result: { successCount, errorCount, failedQuestionIds, total }
            });

            return { successCount, errorCount, failedQuestionIds, total, logs };
        },
        { connection: connection as any, concurrency: 1 }
    );

    bulkAIEditWorker.on('failed', (job, err) => {
        logger.error(`bulkAIEdit job ${job?.id} failed:`, err);
    });

    // ─── Mastery Update Worker ───────────────────────────────────
    // NOTE: studentQuestionHistory model is not yet in Prisma schema.
    // This worker is disabled until the schema is updated.
    masteryUpdateWorker = new Worker(
        'masteryUpdate',
        async (job) => {
            const { studentId, questionId, orgId, isCorrect, timeSecs, wasSkipped } = job.data;

            // Import here to avoid circular deps
            const { prisma } = await import('../config/database');

            // TODO: Re-enable when studentQuestionHistory model is added to Prisma schema
            // For now, log and skip
            logger.info(`[MasteryUpdate] Skipped for student ${studentId}, question ${questionId} — model not in schema`);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _unused = { studentId, questionId, orgId, isCorrect, timeSecs, wasSkipped, prisma };
        },
        { connection: connection as any, concurrency: 10 }
    );

    masteryUpdateWorker.on('failed', (job, err) => {
        logger.error(`masteryUpdate job ${job?.id} failed:`, err);
    });

    // ─── Notification Worker ─────────────────────────────────────
    notificationWorker = new Worker(
        'notification',
        async (job) => {
            const { notificationId } = job.data;
            // TODO: integrate WhatsApp/SMS/Email services
            logger.info(`Processing notification ${notificationId}`);
        },
        { connection: connection as any }
    );

    logger.info('✅ BullMQ queues initialized');
}

