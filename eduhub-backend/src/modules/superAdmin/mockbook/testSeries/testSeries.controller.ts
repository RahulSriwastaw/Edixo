import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getTestSeries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { folderId } = req.query;
        
        const whereClause: any = {};
        if (folderId) whereClause.folderId = String(folderId);

        const series = await prisma.examCategory.findMany({
            where: whereClause,
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { subCategories: true } // Number of subcategories/tests
                }
            }
        });

        // Calculate real studentCount (unique students who attempted any test in the series)
        const enrichedSeries = await Promise.all(series.map(async (s) => {
            const attempts = await prisma.testAttempt.findMany({
                where: {
                    test: {
                        subCategory: {
                            categoryId: s.id
                        }
                    }
                },
                distinct: ['studentId'],
                select: { studentId: true }
            });
            return { ...s, studentCount: attempts.length };
        }));

        res.json({ success: true, data: enrichedSeries });
    } catch (error) {
        next(error);
    }
};

export const getTestSeriesDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const series = await prisma.examCategory.findUnique({
            where: { id },
            include: {
                subCategories: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        mockTests: true
                    }
                }
            }
        });
        if (!series) {
            return res.status(404).json({ success: false, message: 'Test Series not found' });
        }
        const attempts = await prisma.testAttempt.findMany({
            where: {
                test: {
                    subCategory: {
                        categoryId: id
                    }
                }
            },
            distinct: ['studentId'],
            select: { studentId: true }
        });

        res.json({ success: true, data: { ...series, studentCount: attempts.length } });
    } catch (error) {
        next(error);
    }
};

export const createTestSeries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, icon, folderId, isFeatured, isFree, price, isActive, discountPrice } = req.body;
        
        if (!name || !folderId) {
            return res.status(400).json({ success: false, message: 'Name and Folder ID are required' });
        }

        const newSeries = await prisma.examCategory.create({
            data: {
                name,
                description,
                icon,
                folderId,
                isFeatured: isFeatured || false,
                isFree: isFree !== undefined ? isFree : true,
                price: price ? Number(price) : null,
                discountPrice: discountPrice ? Number(discountPrice) : null
            }
        });

        res.status(201).json({ success: true, data: newSeries });
    } catch (error) {
        next(error);
    }
};

export const updateTestSeries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const data = req.body;

        const updatedSeries = await prisma.examCategory.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                folderId: data.folderId,
                isFeatured: data.isFeatured,
                isFree: data.isFree,
                price: data.price ? Number(data.price) : null,
                discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
                
            }
        });

        res.json({ success: true, data: updatedSeries });
    } catch (error) {
        next(error);
    }
};

export const deleteTestSeries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await prisma.examCategory.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Test Series deleted successfully' });
    } catch (error) {
        next(error);
    }
};
