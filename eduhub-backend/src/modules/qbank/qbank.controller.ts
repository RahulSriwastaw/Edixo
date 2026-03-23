import { Request, Response, NextFunction } from 'express';
import { airtableService } from './airtable.service';
import { logger } from '../../config/logger';

export const syncAirtableQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tableName } = req.body;
        if (!tableName) {
            return res.status(400).json({ success: false, message: 'Table name is required' });
        }
        
        logger.info(`Airtable sync triggered for table: ${tableName}`);
        const result = await airtableService.syncQuestionsFromAirtable(tableName);
        
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
