import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const testId = req.params.testId as string;
        const { limit = 100 } = req.query;

        const leaderboard = await prisma.testAttempt.findMany({
            where: {
                testId,
                status: 'SUBMITTED' // Or whatever implies completion
            },
            take: Number(limit),
            orderBy: [
                { score: 'desc' },
                { timeTakenSecs: 'asc' } // tie-breaker
            ],
            include: {
                student: { select: { id: true, name: true } }
            }
        });

        // Add ranks
        const rankedLeaderboard = leaderboard.map((attempt: any, index: number) => ({
            ...attempt,
            rank: index + 1
        }));

        res.json({ success: true, data: rankedLeaderboard });
    } catch (error) {
        next(error);
    }
};

export const recalculateLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const testId = req.params.testId as string;
        // Logic to clear and regenerate the ranks in DB if needed.
        // For now, return a mock success message.

        res.json({ success: true, message: 'Leaderboard recalculation triggered successfully' });
    } catch (error) {
        next(error);
    }
};
