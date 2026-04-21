import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

export const queryCanvas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            query: z.string().min(1).max(2000),
            context: z.string().max(5000).optional(),
            imageBase64: z.string().optional(), // PNG from RepaintBoundary
            language: z.enum(['English', 'Hindi']).default('English'),
            gradeLevel: z.number().int().min(1).max(16).default(10),
        });

        const body = schema.parse(req.body);
        const result = await AIService.getCanvasQueryResponse(body);

        res.json({ success: true, data: result });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: err.errors[0]?.message || 'Invalid query' });
        }
        next(err);
    }
};

export const processTool = async (req: Request, res: Response, next: NextFunction) => {
    try {
         const schema = z.object({
             modelId: z.string().optional(),
             systemPrompt: z.string(),
             userPrompt: z.string(),
             imageBase64: z.string().optional(),
             mimeType: z.string().optional()
         });

         const body = schema.parse(req.body);
         const result = await AIService.processToolRequest(body);

         res.json({ success: true, text: result });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: err.errors[0]?.message || 'Invalid Request' });
        }
        next(err);
    }
};

export const saveDraftQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
             sourceName: z.string().default("AI Extractor"),
             folderId: z.string().optional(),
             questions: z.array(z.object({
                 textEn: z.string(),
                 textHi: z.string().optional(),
                 options: z.array(z.object({
                     textEn: z.string(),
                     textHi: z.string().optional(),
                     isCorrect: z.boolean().default(false),
                     sortOrder: z.number().optional()
                 })).optional(),
                 correctOption: z.string().optional(),
                 explanationEn: z.string().optional(),
                 difficulty: z.string().optional()
             }))
        });

        const { sourceName, questions, folderId } = schema.parse(req.body);
        
        const CHUNK_SIZE = 10;
        const MAX_RETRIES = 2;
        let savedCount = 0;
        let failedChunks = 0;

        // Process questions in small chunks to ensure atomicity and avoid timeouts
        for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
            const chunk = questions.slice(i, i + CHUNK_SIZE);
            const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
            
            let retryCount = 0;
            let success = false;

            while (retryCount <= MAX_RETRIES && !success) {
                try {
                    await prisma.$transaction(async (tx) => {
                        for (let j = 0; j < chunk.length; j++) {
                            const q = chunk[j];
                            // Generate a robust unique ID with sufficient entropy
                            const questionId = `Q-EXT-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${i + j}`;
                            const difficulty = (q.difficulty || 'medium').toLowerCase();

                            await tx.questions.create({
                                data: {
                                    id: questionId,
                                    question_id: questionId,
                                    text_en: q.textEn,
                                    text_hi: q.textHi || null,
                                    is_approved: false,
                                    type: 'mcq',
                                    difficulty: difficulty,
                                    subject_name: sourceName,
                                    chapter_name: 'AI Drafts',
                                    explanation_en: q.explanationEn || null,
                                    ...(folderId ? { folder: { connect: { id: folderId } } } : {}),
                                    question_options: {
                                        create: q.options?.map((opt, optIdx) => ({
                                            id: `OPT-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${i + j}-${optIdx}`,
                                            text_en: opt.textEn,
                                            text_hi: opt.textHi || opt.textEn,
                                            is_correct: opt.isCorrect,
                                            sort_order: opt.sortOrder || optIdx
                                        })) || []
                                    }
                                }
                            });
                        }
                    }, { timeout: 20000 }); // 20s timeout per chunk transaction

                    savedCount += chunk.length;
                    success = true;
                } catch (err: any) {
                    retryCount++;
                    if (retryCount > MAX_RETRIES) {
                        logger.error(`Chunk ${chunkNumber} failed after ${MAX_RETRIES} retries. Error: ${err.message}`);
                        failedChunks++;
                    } else {
                        logger.warn(`Chunk ${chunkNumber} failed (Attempt ${retryCount}/${MAX_RETRIES+1}), retrying... Error: ${err.message}`);
                        // Wait for a short duration before retrying (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, retryCount * 500));
                    }
                }
            }
        }

        res.json({ 
            success: true, 
            message: `Processing complete. Saved ${savedCount}/${questions.length} questions.`,
            stats: {
                total: questions.length,
                saved: savedCount,
                failedChunks
            }
        });
    } catch (err) {
        logger.error("Save Draft Global Error:", err);
        next(err);
    }
};

export const editQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            questionId: z.string().optional(),
            editType: z.enum(['fix_grammar', 'translate', 'simplify', 'generate_options', 'generate_explanation']),
            currentData: z.object({
                question_eng: z.string().optional(),
                question_hin: z.string().optional(),
                solution_eng: z.string().optional(),
                solution_hin: z.string().optional(),
                answer: z.string().optional(),
                questionType: z.string().optional(),
                subject: z.string().optional(),
            }),
            targetLanguage: z.enum(['hin', 'eng']).optional(),
        });

        const body = schema.parse(req.body);
        const result = await AIService.editQuestion(body);

        res.json({ success: true, data: result });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: err.errors[0]?.message || 'Invalid Request' });
        }
        logger.error("AI Edit Question Error:", err);
        next(err);
    }
};

// AI Settings Management
export const getAISettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let settings = await prisma.ai_settings.findUnique({ where: { id: 'singleton' } });
        
        if (!settings) {
            // Initialize defaults if missing
            settings = await prisma.ai_settings.create({
                data: { id: 'singleton' }
            });
        }

        const envStatus = {
            gemini: !!process.env.GEMINI_API_KEY,
            openrouter: !!process.env.OPENROUTER_API_KEY,
            modal: !!process.env.MODAL_API_KEY,
            claude: !!process.env.CLAUDE_API_KEY
        };
        
        res.json({ success: true, data: { ...settings, envStatus } });
    } catch (err) {
        logger.error("Get AI Settings Error:", err);
        next(err);
    }
};

export const updateAISettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            defaultTextModel: z.string().optional(),
            defaultImageModel: z.string().optional(),
            top5Models: z.array(z.string()).optional(),
            apiKeyGemini: z.string().optional(),
            apiKeyOpenRouter: z.string().optional(),
            apiKeyModal: z.string().optional(),
            apiKeyClaude: z.string().optional()
        });

        const data = schema.parse(req.body);
        
        const updated = await prisma.ai_settings.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', ...data },
            update: data
        });

        res.json({ success: true, data: updated, message: "AI Settings updated successfully." });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: err.errors[0]?.message || 'Invalid Request' });
        }
        logger.error("Update AI Settings Error:", err);
        next(err);
    }
};

// Helper for simple sequential DB logic
async function tryCatchTransaction(fn: () => Promise<void>) {
    try {
        await fn();
    } catch (e) {
        logger.error("DB Sequential Op Failed:", e);
        // Continue with next question if one fails
    }
}
