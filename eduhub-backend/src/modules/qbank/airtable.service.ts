import Airtable from 'airtable';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const TABLE_NAME = 'General Awareness';

export interface AirtableQuestionRow {
    question_no?: number;
    question_hin: string;
    question_eng: string;
    subject: string;
    chapter: string;
    type: string;
    option1_hin: string;
    option1_eng: string;
    option2_hin: string;
    option2_eng: string;
    option3_hin: string;
    option3_eng: string;
    option4_hin: string;
    option4_eng: string;
    answer: string; // matches Correct Option "1", "2", etc.
    solution_hin: string;
    solution_eng: string;
    collection: string;
    airtable_table_name: string;
    exam: string;
    section: string;
}

export class AirtableService {
    private base: Airtable.Base;

    constructor() {
        if (!env.AIRTABLE_API_KEY || !env.AIRTABLE_BASE_ID) {
            throw new Error('AIRTABLE_API_KEY or AIRTABLE_BASE_ID is missing in environment variables');
        }
        this.base = new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(env.AIRTABLE_BASE_ID);
    }

    private mapQuestionType(airtableType: string): any {
        const type = String(airtableType).toUpperCase();
        if (type.includes('MCQ')) return 'MCQ_SINGLE';
        if (type.includes('MULTIPLE') || type.includes('MULTI')) return 'MCQ_MULTIPLE';
        if (type.includes('TRUE') || type.includes('FALSE')) return 'TRUE_FALSE';
        if (type.includes('BLANK') || type.includes('FILL')) return 'FILL_IN_BLANK';
        return 'MCQ_SINGLE'; // Default
    }

    /**
     * Fetch all tables in the base using Airtable Meta API
     */
    async fetchAirtableTables() {
        logger.info(`Fetching tables list from Airtable Base: ${env.AIRTABLE_BASE_ID}`);
        try {
            // Note: Requires token with `schema.bases:read` permission
            const response = await fetch(`https://api.airtable.com/v0/meta/bases/${env.AIRTABLE_BASE_ID}/tables`, {
                headers: {
                    'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`
                }
            });
            const data = await response.json() as any;
            
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Airtable Token missing "schema.bases:read" permission. Please enable it in Airtable Developer Hub.');
                }
                throw new Error(data.error?.message || 'Failed to fetch Airtable tables');
            }

            const tables = data.tables;
            // Merge with local sync metadata
            try {
                const metadatas = await (prisma as any).airtable_sync_metadata.findMany();
                return tables.map((table: any) => {
                    const meta = metadatas.find((m: any) => m.table_name === table.name);
                    return {
                        ...table,
                        lastSyncAt: meta?.last_sync_at || null,
                        totalQuestions: meta?.total_questions || 0,
                        syncStatus: meta?.status || 'NOT_SYNCED'
                    };
                });
            } catch (err) {
                logger.warn('Failed to fetch Airtable sync metadata from DB:', err);
                return tables;
            }
        } catch (error) {
            logger.error(`Error fetching tables from Airtable Base:`, error);
            throw error;
        }
    }

    /**
     * Fetch all records from Airtable
     */
    async fetchAirtableRecords(tableName: string) {
        logger.info(`Fetching records from Airtable table: ${tableName}`);
        try {
            const records = await this.base(tableName).select().all();
            return records;
        } catch (error) {
            logger.error(`Error fetching from Airtable table ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * Sync all questions from Airtable to Database
     */
    async syncQuestionsFromAirtable(tableName: string) {
        const records = await this.fetchAirtableRecords(tableName);
        let createdCount = 0;
        let updatedCount = 0;
        let failedCount = 0;

        const folder = await prisma.qBankFolder.findFirst({
            where: { slug: tableName, description: 'AIRTABLE_SYNC' }
        });
        const folderId = folder ? folder.id : null;

        for (const record of records) {
            try {
                const fields = record.fields as unknown as AirtableQuestionRow;
                const recordId = record.id;

                // 1. Prepare Question Data
                const questionData = {
                    id: uuidv4(), // Provide UUID for @id field with no default
                    text_hi: fields.question_hin || '',
                    text_en: fields.question_eng || '',
                    subject_name: fields.subject || 'General Awareness',
                    chapter_name: fields.chapter || 'Miscellaneous',
                    type: this.mapQuestionType(fields.type),
                    explanation_hi: fields.solution_hin || '',
                    explanation_en: fields.solution_eng || '',
                    collection: fields.collection || null,
                    airtable_table_name: fields.airtable_table_name || tableName,
                    exam: fields.exam || 'SSC CGL',
                    folderId: folderId,
                };

                // 2. Options Mapping
                const options = [
                    { hi: fields.option1_hin, en: fields.option1_eng, key: '1' },
                    { hi: fields.option2_hin, en: fields.option2_eng, key: '2' },
                    { hi: fields.option3_hin, en: fields.option3_eng, key: '3' },
                    { hi: fields.option4_hin, en: fields.option4_eng, key: '4' },
                ].filter(opt => opt.hi || opt.en); // Filter out empty options

                // 3. Upsert Logic
                const existingQuestion = await (prisma as any).questions.findFirst({
                    where: { record_id: recordId },
                    include: { question_options: true }
                });

                if (existingQuestion) {
                    // Update existing
                    await prisma.$transaction([
                        (prisma as any).questions.update({
                            where: { id: existingQuestion.id },
                            data: questionData
                        }),
                        // Recreate options
                        (prisma as any).question_options.deleteMany({ where: { question_id: existingQuestion.id } }),
                        (prisma as any).question_options.createMany({
                            data: options.map((opt, index) => ({
                                id: uuidv4(),
                                question_id: existingQuestion.id,
                                text_hi: opt.hi || '',
                                text_en: opt.en || '',
                                is_correct: String(fields.answer) === opt.key,
                                sort_order: index
                            }))
                        })
                    ]);
                    updatedCount++;
                }
 else {
                    // Create new
                    const internalQuestionId = `Q-AIR-${Date.now()}-${fields.question_no || Math.floor(Math.random() * 1000)}`;
                    
                    await (prisma as any).questions.create({
                        data: {
                            ...questionData,
                            question_id: internalQuestionId,
                            record_id: recordId,
                            question_options: {
                                create: options.map((opt, index) => ({
                                    id: uuidv4(),
                                    text_hi: opt.hi || '',
                                    text_en: opt.en || '',
                                    is_correct: String(fields.answer) === opt.key,
                                    sort_order: index
                                }))
                            }
                        }
                    });
                    createdCount++;
                }
            } catch (err) {
                logger.error(`Failed to sync Airtable record ${record.id}:`, err);
                failedCount++;
            }
        }
        const result = { createdCount, updatedCount, failedCount, total: records.length };

        // Update Sync Metadata
        await (prisma as any).airtable_sync_metadata.upsert({
            where: { table_name: tableName },
            update: {
                total_questions: records.length,
                last_sync_at: new Date(),
                status: 'SUCCESS',
                error: null
            },
            create: {
                table_name: tableName,
                total_questions: records.length,
                last_sync_at: new Date(),
                status: 'SUCCESS'
            }
        });

        return result;
    }
}

export const airtableService = new AirtableService();
