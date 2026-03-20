import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// Public route for organization branding (name, logo, theme, frontendConfig)
router.get('/public/:orgId', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { 
                OR: [
                    { orgId: req.params.orgId },
                    { subdomain: req.params.orgId }
                ],
                deletedAt: null 
            },
            select: {
                orgId: true,
                name: true,
                logoUrl: true,
                primaryColor: true,
                subdomain: true,
                customDomain: true,
                frontendConfig: true,
            }
        });
        if (!org) throw new AppError('Organization not found', 404);
        res.json({ success: true, data: org });
    } catch (err) { next(err); }
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [orgs, total] = await Promise.all([
            prisma.organization.findMany({
                where: { deletedAt: null },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.organization.count({ where: { deletedAt: null } }),
        ]);
        res.json({ success: true, data: { orgs, total } });
    } catch (err) { next(err); }
});

router.get('/:orgId', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
            include: { featureFlags: true, personalizationSettings: true },
        });
        if (!org) throw new AppError('Organization not found', 404);
        res.json({ success: true, data: org });
    } catch (err) { next(err); }
});

// Update frontendConfig for an org (Super Admin only)
router.put('/:orgId/frontend-config', async (req, res, next) => {
    try {
        const configSchema = z.object({
            promoBanners: z.array(z.object({
                id: z.string(),
                imageUrl: z.string(),
                linkUrl: z.string().optional(),
                title: z.string().optional(),
                subtitle: z.string().optional(),
                badgeText: z.string().optional(),
                ctaText: z.string().optional(),
                gradient: z.string().optional(),
            })).optional(),
            quickLinks: z.array(z.object({
                id: z.string(),
                icon: z.string(),
                label: z.string(),
                linkUrl: z.string(),
                color: z.string().optional(),
            })).optional(),
            suggestedTestIds: z.array(z.string()).optional(),
            heroText: z.string().optional(),
            heroSubText: z.string().optional(),
            stats: z.array(z.object({
                label: z.string(),
                value: z.string(),
            })).optional(),
        });
        const config = configSchema.parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        const updated = await prisma.organization.update({
            where: { id: org.id },
            data: { frontendConfig: config },
        });
        res.json({ success: true, data: updated.frontendConfig });
    } catch (err) { next(err); }
});

export default router;
