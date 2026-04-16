import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.examFolder.findMany({
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
        const { name, description, icon, color, isFeatured, isActive, sortOrder } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const newCategory = await prisma.examFolder.create({
            data: {
                name,
                description,
                icon,
                color,
                isFeatured: isFeatured || false,
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
        const data = {
            name: req.body.name,
            description: req.body.description,
            icon: req.body.icon,
            color: req.body.color,
            isFeatured: req.body.isFeatured,
            sortOrder: req.body.sortOrder,
        };

        const updatedCategory = await prisma.examFolder.update({
            where: { id },
            data
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
