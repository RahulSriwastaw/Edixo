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

        // Calculate real studentCount (unique students who attempted any test in any series within this folder)
        const enrichedCategories = await Promise.all(categories.map(async (cat) => {
            const attempts = await prisma.testAttempt.findMany({
                where: {
                    test: {
                        subCategory: {
                            category: {
                                folderId: cat.id
                            }
                        }
                    }
                },
                distinct: ['studentId'],
                select: { studentId: true }
            });
            return { ...cat, studentCount: attempts.length };
        }));

        res.json({ success: true, data: enrichedCategories });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, icon, color, isFeatured, isActive, sortOrder, interfaceThemeId } = req.body;

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
                sortOrder: sortOrder || 0,
                interfaceThemeId: interfaceThemeId || null,
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
        const data: any = {
            name: req.body.name,
            description: req.body.description,
            icon: req.body.icon,
            color: req.body.color,
            isFeatured: req.body.isFeatured,
            sortOrder: req.body.sortOrder,
        };
        if (req.body.interfaceThemeId !== undefined) {
            data.interfaceThemeId = req.body.interfaceThemeId || null;
        }

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
