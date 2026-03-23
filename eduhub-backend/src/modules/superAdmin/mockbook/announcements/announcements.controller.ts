import { Request, Response, NextFunction } from 'express';

export const getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: [] }); // Stub
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    res.status(201).json({ success: true, data: { ...req.body, id: 'mock-id' } });
};
