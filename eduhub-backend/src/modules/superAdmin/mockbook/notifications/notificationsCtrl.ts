import { Request, Response, NextFunction } from 'express';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: [] }); // Stub
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
    res.status(201).json({ success: true, data: { ...req.body, id: 'mock-id' } });
};
// Triggering IDE TS Server refresh
