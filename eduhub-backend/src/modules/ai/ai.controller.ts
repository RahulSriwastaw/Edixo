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
        
        let savedCount = 0;
        for (const q of questions) {
            try {
                const questionId = `Q-EXT-${Date.now()}-${Math.floor(Math.random() * 10000)}-${savedCount}`;
                const difficulty = (q.difficulty || 'medium').toLowerCase();

                await prisma.questions.create({
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
                            create: q.options?.map((opt, idx) => ({
                                id: `OPT-${Date.now()}-${Math.floor(Math.random() * 10000)}-${savedCount}-${idx}`,
                                text_en: opt.textEn,
                                text_hi: opt.textHi || opt.textEn,
                                is_correct: opt.isCorrect,
                                sort_order: opt.sortOrder || idx
                            })) || []
                        }
                    }
                });
                savedCount++;
            } catch (err: any) {
                logger.error(`Failed to save draft question: ${err.message}`);
            }
        }

        res.json({ success: true, message: `Saved ${savedCount} drafts successfully with options.` });
    } catch (err) {
        logger.error("Save Draft Error:", err);
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
