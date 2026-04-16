import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../config/database';

export const getLiveTests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const liveTests = await prisma.mockTest.findMany({
            where: {
                status: 'LIVE'
            },
            include: {
                _count: { select: { attempts: true } } // active participants
            }
        });

        res.json({ success: true, data: liveTests });
    } catch (error) {
        next(error);
    }
};

export const extendLiveTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { newEndTime } = req.body;

        const updatedTest = await prisma.mockTest.update({
            where: { id },
            data: { endsAt: new Date(newEndTime) }
        });

        res.json({ success: true, data: updatedTest });
    } catch (error) {
        next(error);
    }
};
