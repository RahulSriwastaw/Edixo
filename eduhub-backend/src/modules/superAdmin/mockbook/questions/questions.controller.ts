import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';
import { randomBytes } from 'crypto';

export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { folderId, difficulty, type, search, page = 1, limit = 50 } = req.query;

        const whereClause: any = {};
        if (folderId) whereClause.folderId = String(folderId);
        if (difficulty) whereClause.difficulty = String(difficulty);
        if (type) whereClause.type = String(type);
        if (search) {
            whereClause.text_en = { contains: String(search), mode: 'insensitive' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [questions, total] = await Promise.all([
            prisma.questions.findMany({
                where: whereClause,
                skip,
                take: Number(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    question_options: true
                }
            }),
            prisma.questions.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: {
                data: questions,
                meta: { total, page: Number(page), limit: Number(limit) }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getQuestionDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const question = await prisma.questions.findUnique({
            where: { id },
            include: { question_options: true }
        });

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.json({ success: true, data: question });
    } catch (error) {
        next(error);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            textEn, textHi, explanationEn, explanationHi,
            type, difficulty, folderId, topicId, imageUrl, tags, options
        } = req.body;

        if (!textEn) {
            return res.status(400).json({ success: false, message: 'Question text is required' });
        }

        const question = await prisma.questions.create({
            data: {
                id: randomBytes(16).toString('hex'),
                question_id: `GK-Q-${randomBytes(4).toString('hex').toUpperCase()}`,
                text_en: textEn,
                text_hi: textHi,
                explanation_en: explanationEn,
                explanation_hi: explanationHi,
                type: type || 'mcq',
                difficulty: difficulty || 'medium',
                ...(folderId ? { folder: { connect: { id: folderId } } } : {}),
                // imageUrl: imageUrl, // Missing in schema
                question_options: {
                    create: options ? options.map((opt: any, idx: number) => ({
                        id: randomBytes(8).toString('hex'), // Schema id is not autoincrement
                        text_en: opt.textEn,
                        text_hi: opt.textHi,
                        is_correct: opt.isCorrect || false,
                        sort_order: opt.sortOrder !== undefined ? opt.sortOrder : idx
                    })) : []
                }
            },
            include: { question_options: true }
        });

        res.status(201).json({ success: true, data: question });
    } catch (error) {
        next(error);
    }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        // If options are provided, we should probably delete the old ones and recreate
        // or update them if they map properly. For simplicity, delete and recreate.
        
        const updateData: any = {
            text_en: data.textEn,
            text_hi: data.textHi,
            explanation_en: data.explanationEn,
            explanation_hi: data.explanationHi,
            type: data.type,
            difficulty: data.difficulty,
        };

        if (data.options && Array.isArray(data.options)) {
            await prisma.question_options.deleteMany({ where: { question_id: id } });
            updateData.question_options = {
                create: data.options.map((opt: any, idx: number) => ({
                    id: randomBytes(8).toString('hex'),
                    text_en: opt.textEn,
                    text_hi: opt.textHi,
                    is_correct: opt.isCorrect || false,
                    sort_order: opt.sortOrder !== undefined ? opt.sortOrder : idx
                }))
            };
        }

        const updatedQuestion = await prisma.questions.update({
            where: { id },
            data: updateData,
            include: { question_options: true }
        });

        res.json({ success: true, data: updatedQuestion });
    } catch (error) {
        next(error);
    }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await prisma.questions.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const importQuestions = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: 'CSV Import not implemented yet' });
};

export const exportQuestions = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: 'CSV Export not implemented yet' });
};
