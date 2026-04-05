import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { safeRedisGet, redisKeys } from '../config/redis';
import { AppError } from './errorHandler';

export interface JwtPayload {
    userId: string;
    role: string;
    permissions?: string[];
    type?: string;
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        if (!token) throw new AppError('Invalid token format', 401);

        // Check blacklist
        const isBlacklisted = await safeRedisGet(redisKeys.tokenBlacklist(token));
        if (isBlacklisted) throw new AppError('Token has been revoked', 401);

        // Decode to pick the right secret
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (!decoded) throw new AppError('Invalid token', 401);

        const secret = decoded.role === 'SUPER_ADMIN'
            ? env.JWT_SUPER_ADMIN_SECRET
            : env.JWT_SECRET;

        const verified = jwt.verify(token, secret) as JwtPayload;
        req.user = verified;
        next();
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid token', 401));
        }
        if (err instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token expired', 401));
        }
        next(err);
    }
};

export const optionalAuthenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) return next();

        // Check blacklist
        const isBlacklisted = await safeRedisGet(redisKeys.tokenBlacklist(token));
        if (isBlacklisted) return next();

        // Decode to pick the right secret
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (!decoded) return next();

        const secret = decoded.role === 'SUPER_ADMIN'
            ? env.JWT_SUPER_ADMIN_SECRET
            : env.JWT_SECRET;

        const verified = jwt.verify(token, secret) as JwtPayload;
        req.user = verified;
        next();
    } catch (err) {
        // Log error but proceed without user
        next();
    }
};

export const requireSuperAdmin = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== 'SUPER_ADMIN') {
        return next(new AppError('Super Admin access required', 403));
    }
    next();
};

export const requirePermission = (permission: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { user } = req;
        if (!user) return next(new AppError('Unauthorized', 401));

        // Super Admin has all permissions
        if (user.role === 'SUPER_ADMIN') return next();

        if (user.permissions?.includes(permission) || user.permissions?.includes('*')) {
            return next();
        }

        next(new AppError(`Permission required: ${permission}`, 403));
    };
};
