import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getSubCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categoryId } = req.query;
        
        const whereClause: any = {};
        if (categoryId) whereClause.categoryId = String(categoryId);

        const subCats = await prisma.examSubCategory.findMany({
            where: whereClause,
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { mockTests: true }
                }
            }
        });

        res.json({ success: true, data: subCats });
    } catch (error) {
        next(error);
    }
};

export const createSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, categoryId, parentId, sortOrder } = req.body;
        
        if (!name || !categoryId) {
            return res.status(400).json({ success: false, message: 'Name and Category ID are required' });
        }

        const newSubCat = await prisma.examSubCategory.create({
            data: {
                name,
                description: description || null,
                categoryId,
                parentId: parentId || null,
                sortOrder: sortOrder || 0
            }
        });

        res.status(201).json({ success: true, data: newSubCat });
    } catch (error) {
        next(error);
    }
};

export const updateSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        const updated = await prisma.examSubCategory.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                parentId: data.parentId,
                sortOrder: data.sortOrder,
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await prisma.examSubCategory.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Subcategory deleted successfully' });
    } catch (error) {
        next(error);
    }
};
