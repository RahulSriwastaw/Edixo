import { Request, Response, NextFunction } from 'express';
import { airtableService } from './airtable.service';
import { logger } from '../../config/logger';
import { prisma } from '../../config/database';
import { z } from 'zod';

export const syncAirtableQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tableName } = req.body;
        if (!tableName) {
            return res.status(400).json({ success: false, message: 'Table name is required' });
        }
        
        logger.info(`Airtable sync triggered for table: ${tableName}`);
        const result = await airtableService.syncQuestionsFromAirtable(tableName);
        
        // Update the folder's updatedAt to represent last sync date
        await prisma.qBankFolder.updateMany({
            where: { slug: tableName, description: 'AIRTABLE_SYNC' },
            data: { updatedAt: new Date() }
        });
        
        res.json({
            success: true,
            message: 'Airtable synchronization completed',
            data: result
        });
    } catch (error: any) {
        console.error('CRITICAL: Airtable sync failed:', error);
        logger.error('Airtable sync controller error:', error);
        next(error);
    }
};

export const getAirtableTables = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tables = await airtableService.fetchAirtableTables();
        res.json({ success: true, data: tables });
    } catch (error: any) {
        logger.error('Failed to fetch Airtable Meta tables:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to fetch tables' });
    }
};

export const getAirtableSyncFolders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = req.query.orgId || req.headers['x-org-id'] || (req as any).user?.orgId;

        const folders = await prisma.qBankFolder.findMany({
            where: {
                description: 'AIRTABLE_SYNC',
                ...(orgId ? { orgId: String(orgId) } : {})
            },
            orderBy: { createdAt: 'desc' }
        });

        // Compute total questions for each folder
        const foldersWithCounts = await Promise.all(folders.map(async (folder) => {
            const count = await (prisma as any).questions.count({
                where: { 
                    airtable_table_name: folder.slug,
                    deleted_at: null 
                }
            });
            return {
                ...folder,
                totalQuestions: count
            };
        }));
        
        res.json({ success: true, data: foldersWithCounts });
    } catch (error) {
        next(error);
    }
};

export const createAirtableSyncFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, airtableTableName, orgId } = req.body;
        if (!name || !airtableTableName) {
            return res.status(400).json({ success: false, message: 'Both name and airtableTableName are required' });
        }

        const folder = await prisma.qBankFolder.create({
            data: {
                name,
                slug: airtableTableName,
                description: 'AIRTABLE_SYNC',
                scope: 'ORG',
                path: `/airtable/${airtableTableName}`,
                orgId: orgId || null
            }
        });

        res.status(201).json({ success: true, data: folder, message: 'Airtable Sync Source added successfully' });
    } catch (error) {
        next(error);
    }
};

export const renameAirtableSyncFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const folder = await prisma.qBankFolder.update({
            where: { id: req.params.id as string },
            data: { name }
        });
        
        res.json({ success: true, data: folder, message: 'Folder renamed successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteAirtableSyncFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const folderId = req.params.id as string;
        const folder = await prisma.qBankFolder.findUnique({ where: { id: folderId } });

        if (!folder || folder.description !== 'AIRTABLE_SYNC') {
            return res.status(404).json({ success: false, message: 'Folder not found or not an Airtable source' });
        }

        // Delete associated questions explicitly if desired, or leave them. Usually admin wants to clean up 
        // to prevent duplicate or orphaned questions.
        if (folder.slug) {
            await (prisma as any).question_options.deleteMany({
                where: { questions: { airtable_table_name: folder.slug } }
            });
            await prisma.attemptAnswer.deleteMany({
                where: { questionId: { in: (await (prisma as any).questions.findMany({ where: { airtable_table_name: folder.slug }, select: { id: true } })).map((q: any) => q.id) } }
            });
            /* Missing model
            await prisma.studentQuestionHistory.deleteMany({
                where: { question: { airtableTableName: folder.slug } }
            });
            */
            await (prisma as any).questions.deleteMany({
                where: { airtable_table_name: folder.slug }
            });
        }

        await prisma.qBankFolder.delete({ where: { id: folderId } });
        
        res.json({ success: true, message: 'Airtable sync folder and associated local data removed successfully. Airtable data was untouched.' });
    } catch (error) {
        next(error);
    }
};
