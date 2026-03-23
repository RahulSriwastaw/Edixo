import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';
import { randomBytes } from 'crypto';

export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orgId, folderId, difficulty, type, search, page = 1, limit = 50 } = req.query;

        const whereClause: any = {};
        if (orgId) whereClause.orgId = String(orgId);
        if (folderId) whereClause.folderId = String(folderId);
        if (difficulty) whereClause.difficulty = String(difficulty);
        if (type) whereClause.type = String(type);
        if (search) {
            whereClause.textEn = { contains: String(search), mode: 'insensitive' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where: whereClause,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    options: true
                }
            }),
            prisma.question.count({ where: whereClause })
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
        const question = await prisma.question.findUnique({
            where: { id },
            include: { options: true }
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
            orgId, textEn, textHi, explanationEn, explanationHi,
            type, difficulty, folderId, topicId, imageUrl, tags, options
        } = req.body;

        if (!textEn) {
            return res.status(400).json({ success: false, message: 'Question text is required' });
        }

        const question = await prisma.question.create({
            data: {
                questionId: `GK-Q-${randomBytes(4).toString('hex').toUpperCase()}`,
                orgId: orgId || null,
                folderId: folderId || null,
                topicId: topicId || null,
                textEn,
                textHi,
                explanationEn,
                explanationHi,
                type: type || 'MCQ_SINGLE',
                difficulty: difficulty || 'MEDIUM',
                imageUrl,
                tags: tags || [],
                options: {
                    create: options ? options.map((opt: any, idx: number) => ({
                        textEn: opt.textEn,
                        textHi: opt.textHi,
                        imageUrl: opt.imageUrl,
                        isCorrect: opt.isCorrect || false,
                        sortOrder: opt.sortOrder !== undefined ? opt.sortOrder : idx
                    })) : []
                }
            },
            include: { options: true }
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
            textEn: data.textEn,
            textHi: data.textHi,
            explanationEn: data.explanationEn,
            explanationHi: data.explanationHi,
            type: data.type,
            difficulty: data.difficulty,
            imageUrl: data.imageUrl,
            tags: data.tags,
            folderId: data.folderId,
            topicId: data.topicId,
        };

        if (data.options && Array.isArray(data.options)) {
            await prisma.questionOption.deleteMany({ where: { questionId: id } });
            updateData.options = {
                create: data.options.map((opt: any, idx: number) => ({
                    textEn: opt.textEn,
                    textHi: opt.textHi,
                    imageUrl: opt.imageUrl,
                    isCorrect: opt.isCorrect || false,
                    sortOrder: opt.sortOrder !== undefined ? opt.sortOrder : idx
                }))
            };
        }

        const updatedQuestion = await prisma.question.update({
            where: { id },
            data: updateData,
            include: { options: true }
        });

        res.json({ success: true, data: updatedQuestion });
    } catch (error) {
        next(error);
    }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await prisma.question.delete({
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
