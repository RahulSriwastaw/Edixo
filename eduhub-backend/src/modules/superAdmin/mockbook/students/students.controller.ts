import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getStudentsList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orgId, search, page = 1, limit = 50 } = req.query;

        const whereClause: any = { isActive: true };
        if (orgId) whereClause.orgId = String(orgId);
        if (search) {
            whereClause.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } },
                { phone: { contains: String(search) } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where: whereClause,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { email: true } },
                    _count: { select: { testAttempts: true } }
                }
            }),
            prisma.student.count({ where: whereClause })
        ]);

        const mappedStudents = students.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.user?.email,
            phone: s.user?.phone,
            orgId: s.orgId,
            testAttemptsCount: s._count.testAttempts,
            createdAt: s.createdAt
        }));

        res.json({
            success: true,
            data: mappedStudents,
            meta: { total, page: Number(page), limit: Number(limit) }
        });
    } catch (error) {
        next(error);
    }
};

export const getStudentDrilldown = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: { select: { email: true } },
                testAttempts: {
                    orderBy: { startedAt: 'desc' },
                    include: { test: { select: { name: true, testId: true } } }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

export const invalidateAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const attemptId = req.params.attemptId as string;
        
        await prisma.testAttempt.delete({
            where: { id: attemptId }
        });

        res.json({ success: true, message: 'Attempt invalidated successfully' });
    } catch (error) {
        next(error);
    }
};
