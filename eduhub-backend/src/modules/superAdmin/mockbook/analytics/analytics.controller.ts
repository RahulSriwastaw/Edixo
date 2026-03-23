import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getOverviewStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orgId } = req.query;
        // In reality, run complex aggregates. Here we return mock KPI data
        // to satisfy the frontend Dashboard view.

        res.json({
            success: true,
            data: {
                totalTests: 120,
                totalAttempts: 4500,
                activeStudents: 850,
                revenueMTD: 50000,
                dailyAttempts: [
                    { name: 'Mon', value: 400 },
                    { name: 'Tue', value: 300 },
                    { name: 'Wed', value: 200 },
                    { name: 'Thu', value: 278 },
                    { name: 'Fri', value: 189 },
                    { name: 'Sat', value: 239 },
                    { name: 'Sun', value: 349 },
                ]
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTestAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { testId } = req.params;

        // Mock test analytics
        res.json({
            success: true,
            data: {
                testId,
                averageScore: 65,
                highestScore: 98,
                totalParticipants: 350,
                scoreDistribution: [
                    { range: '0-20', count: 10 },
                    { range: '21-40', count: 40 },
                    { range: '41-60', count: 120 },
                    { range: '61-80', count: 150 },
                    { range: '81-100', count: 30 },
                ]
            }
        });
    } catch (error) {
        next(error);
    }
};
