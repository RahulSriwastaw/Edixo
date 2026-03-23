import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orgId } = req.query;
        
        const whereClause: any = {};
        if (orgId) whereClause.orgId = String(orgId);

        const categories = await prisma.examFolder.findMany({
            where: whereClause,
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { categories: true } // Number of Test Series inside
                }
            }
        });

        const enrichedCategories = categories.map((cat: any) => ({
            ...cat,
            studentCount: 0 // Mock placeholder until enrollments are mapped
        }));

        res.json({ success: true, data: enrichedCategories });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, icon, color, orgId, isFeatured, isActive, sortOrder } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const newCategory = await prisma.examFolder.create({
            data: {
                name,
                description,
                icon,
                color,
                orgId: orgId || null,
                isFeatured: isFeatured || false,
                isActive: isActive !== undefined ? isActive : true,
                sortOrder: sortOrder || 0
            }
        });

        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        const updatedCategory = await prisma.examFolder.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                color: data.color,
                isFeatured: data.isFeatured,
                isActive: data.isActive,
                sortOrder: data.sortOrder,
            }
        });

        res.json({ success: true, data: updatedCategory });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await prisma.examFolder.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};
