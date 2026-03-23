import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';
import { randomBytes } from 'crypto';

export const getTests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orgId, subCategoryId, status, search } = req.query;

        const whereClause: any = {};
        if (orgId) whereClause.orgId = String(orgId);
        if (subCategoryId) whereClause.subCategoryId = String(subCategoryId);
        if (status) whereClause.status = String(status);
        if (search) {
            whereClause.title = { contains: String(search), mode: 'insensitive' };
        }

        const tests = await prisma.mockTest.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { attempts: true, sections: true }
                },
                subCategory: {
                    select: {
                        name: true,
                        category: { select: { id: true, name: true } }
                    }
                }
            }
        });

        res.json({ success: true, data: tests });
    } catch (error) {
        next(error);
    }
};

export const getTestDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const test = await prisma.mockTest.findUnique({
            where: { id },
            include: {
                sections: true,
                subCategory: {
                    select: {
                        name: true,
                        category: { select: { id: true, name: true } }
                    }
                }
            }
        });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        res.json({ success: true, data: test });
    } catch (error) {
        next(error);
    }
};

export const createTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            orgId, name, durationMins, totalMarks, subCategoryId,
            description, isPublic, shuffleQuestions, scheduledAt, endsAt, maxAttempts
        } = req.body;

        if (!name || !durationMins) {
            return res.status(400).json({ success: false, message: 'Name and Duration are required' });
        }

        const newTest = await prisma.mockTest.create({
            data: {
                testId: `GK-T-${randomBytes(4).toString('hex').toUpperCase()}`,
                pin: randomBytes(3).toString('hex').toUpperCase(),
                orgId: orgId,
                name,
                durationMins: Number(durationMins),
                totalMarks: Number(totalMarks || 0),
                subCategoryId: subCategoryId || null,
                description: description || null,
                isPublic: isPublic || false,
                shuffleQuestions: shuffleQuestions || false,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                endsAt: endsAt ? new Date(endsAt) : null,
                maxAttempts: Number(maxAttempts || 1),
                status: 'DRAFT',
            }
        });

        res.status(201).json({ success: true, data: newTest });
    } catch (error) {
        next(error);
    }
};

export const updateTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        const updatedTest = await prisma.mockTest.update({
            where: { id },
            data: {
                name: data.name,
                durationMins: data.durationMins ? Number(data.durationMins) : undefined,
                totalMarks: data.totalMarks ? Number(data.totalMarks) : undefined,
                subCategoryId: data.subCategoryId,
                description: data.description,
                isPublic: data.isPublic,
                shuffleQuestions: data.shuffleQuestions,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                endsAt: data.endsAt ? new Date(data.endsAt) : null,
                maxAttempts: data.maxAttempts ? Number(data.maxAttempts) : undefined,
                status: data.status,
            }
        });

        res.json({ success: true, data: updatedTest });
    } catch (error) {
        next(error);
    }
};

export const updateTestStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        if (!['DRAFT', 'LIVE', 'ENDED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updatedTest = await prisma.mockTest.update({
            where: { id },
            data: { status }
        });

        res.json({ success: true, data: updatedTest });
    } catch (error) {
        next(error);
    }
};

export const deleteTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await prisma.mockTest.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Test deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const cloneTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const test = await prisma.mockTest.findUnique({ where: { id } });

        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

        const { id: _, createdAt: __, updatedAt: ___, testId: ____, name: _____, status: ______, ...rest } = test;

        const clonedTest = await prisma.mockTest.create({
            data: {
                ...rest,
                testId: `GK-T-${randomBytes(4).toString('hex').toUpperCase()}`,
                name: test.name + ' (Copy)',
                status: 'DRAFT',
            }
        });

        res.status(201).json({ success: true, data: clonedTest });
    } catch (error) {
        next(error);
    }
};

// Test sections management
export const addTestSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { setId, name, durationMins } = req.body;

        const newSection = await prisma.mockTestSection.create({
            data: {
                testId: id,
                setId,
                name,
                durationMins: durationMins ? Number(durationMins) : null,
            }
        });

        res.status(201).json({ success: true, data: newSection });
    } catch (error) {
        next(error);
    }
};

export const removeTestSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const sectionId = req.params.sectionId as string;
        await prisma.mockTestSection.delete({
            where: { id: sectionId, testId: id } // Ensuring the section belongs to the right test
        });
        res.json({ success: true, message: 'Section removed successfully' });
    } catch (error) {
        next(error);
    }
};
