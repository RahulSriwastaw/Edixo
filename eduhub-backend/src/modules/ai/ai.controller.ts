import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { z } from 'zod';

export const queryCanvas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            query: z.string().min(1).max(2000),
            context: z.string().max(5000).optional(),
            imageBase64: z.string().optional(), // PNG from RepaintBoundary
            language: z.enum(['English', 'Hindi']).default('English'),
            gradeLevel: z.number().int().min(1).max(16).default(10),
        });

        const body = schema.parse(req.body);
        const result = await AIService.getCanvasQueryResponse(body);

        res.json({ success: true, data: result });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: err.errors[0]?.message || 'Invalid query' });
        }
        next(err);
    }
};
