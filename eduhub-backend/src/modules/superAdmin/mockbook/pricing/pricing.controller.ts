import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';
import { AppError } from '../../../../middleware/errorHandler';

export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const plans = await (prisma as any).mockbookPlan.findMany({
            orderBy: { sortOrder: 'asc' }
        });
        res.json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        if (!data.name || !data.price || !data.durationDays) {
            throw new AppError('Name, price and duration are required', 400);
        }

        const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const plan = await (prisma as any).mockbookPlan.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                price: Number(data.price),
                discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
                durationDays: Number(data.durationDays),
                features: data.features || [],
                accessType: data.accessType || 'GLOBAL',
                examCategoryIds: data.examCategoryIds || [],
                isActive: data.isActive !== undefined ? data.isActive : true,
                sortOrder: data.sortOrder || 0
            }
        });

        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        next(error);
    }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updated = await (prisma as any).mockbookPlan.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                price: data.price !== undefined ? Number(data.price) : undefined,
                discountPrice: data.discountPrice !== undefined ? Number(data.discountPrice) : undefined,
                durationDays: data.durationDays !== undefined ? Number(data.durationDays) : undefined,
                features: data.features,
                accessType: data.accessType,
                examCategoryIds: data.examCategoryIds,
                isActive: data.isActive,
                sortOrder: data.sortOrder
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await (prisma as any).mockbookPlan.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscriptions = await (prisma as any).studentSubscription.findMany({
            include: {
                student: true,
                plan: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};
