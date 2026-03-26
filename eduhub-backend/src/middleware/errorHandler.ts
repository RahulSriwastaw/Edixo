import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ZodError } from 'zod';
import { env } from '../config/env';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
    }

    // JSON parse errors (SyntaxError from body-parser)
    if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
        logger.error('JSON Parse Error. Raw body:', (req as any).rawBody);
        return res.status(400).json({
            success: false,
            message: 'Malformed JSON in request body',
        });
    }

    // Known operational errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // Prisma unique constraint
    if ((err as any).code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists',
            field: (err as any).meta?.target,
        });
    }

    // Prisma not found
    if ((err as any).code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found',
        });
    }

    // Unknown errors
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
        stack: env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};
