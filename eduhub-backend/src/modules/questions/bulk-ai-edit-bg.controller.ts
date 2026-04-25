import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';
import { AppError } from '../../middleware/errorHandler';

// Lazy import to avoid loading queues.ts at module load time (before Redis connects)
async function getBulkAIEditQueue() {
    const { bulkAIEditQueue } = await import('../../jobs/queues');
    if (!bulkAIEditQueue) {
        throw new AppError('Background job queue not available (Redis may not be connected)', 503);
    }
    return bulkAIEditQueue;
}

interface BulkEditRequest {
    question_ids: string[];
    edit_type: 'question_variation' | 'language_variation' | 'solution_add' | 'custom';
    action?: string;
    language?: string;
    custom_prompt?: string;
    ai_provider: 'gemini' | 'openai' | 'claude' | 'ollama';
    model: string;
}

interface BulkAIEditProgress {
    logs?: any[];
    successCount?: number;
    errorCount?: number;
    failedQuestionIds?: string[];
    progress?: number;
}

// Submit a bulk AI edit job to the background queue
export const bulkAIEditBackgroundController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: BulkEditRequest = req.body;

        // Validate required fields
        if (!body.question_ids || body.question_ids.length === 0) {
            throw new AppError('No questions selected', 400);
        }
        if (!body.edit_type || !body.ai_provider || !body.model) {
            throw new AppError('Missing required fields: edit_type, ai_provider, model', 400);
        }

        // Get API key based on provider
        let apiKey = '';
        switch (body.ai_provider) {
            case 'gemini':
                apiKey = process.env.GEMINI_API_KEY || '';
                break;
            case 'openai':
                apiKey = process.env.OPENAI_API_KEY || '';
                break;
            case 'claude':
                apiKey = process.env.CLAUDE_API_KEY || '';
                break;
            default:
                throw new AppError('Unsupported AI provider', 400);
        }

        if (!apiKey) {
            throw new AppError(`API key for ${body.ai_provider} not configured`, 500);
        }

        const queue = await getBulkAIEditQueue();
        const job = await queue.add('bulk-ai-edit', {
            question_ids: body.question_ids,
            edit_type: body.edit_type,
            action: body.action,
            language: body.language,
            custom_prompt: body.custom_prompt,
            ai_provider: body.ai_provider,
            model: body.model,
            apiKey,
            isRetry: false,
            originalFailedIds: []
        }, {
            attempts: 1,
            backoff: {
                type: 'exponential',
                delay: 5000
            },
            removeOnComplete: {
                age: 3600, // Keep completed jobs for 1 hour
                count: 50
            },
            removeOnFail: {
                age: 7200, // Keep failed jobs for 2 hours
                count: 100
            }
        });

        logger.info(`Bulk AI Edit job ${job.id} queued for ${body.question_ids.length} questions`);

        res.status(202).json({
            success: true,
            message: 'Bulk AI Edit job queued successfully',
            jobId: job.id,
            status: 'queued',
            totalQuestions: body.question_ids.length
        });

    } catch (error: any) {
        logger.error('Bulk AI Edit Background Controller error:', error);
        next(error);
    }
};

// Get job status and progress
export const bulkAIEditStatusController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobId = String(req.params.jobId);

        if (!jobId || jobId === 'undefined') {
            throw new AppError('Job ID is required', 400);
        }

        const queue = await getBulkAIEditQueue();
        const job = await queue.getJob(jobId);

        if (!job) {
            throw new AppError('Job not found', 404);
        }

        const state = await job.getState();
        const progressData = (job.progress || {}) as BulkAIEditProgress;
        const result = job.data?.result || null;

        // Get latest logs from progress
        const logs = progressData?.logs || [];
        const successCount = progressData?.successCount ?? result?.successCount ?? 0;
        const errorCount = progressData?.errorCount ?? result?.errorCount ?? 0;
        const failedQuestionIds = progressData?.failedQuestionIds ?? result?.failedQuestionIds ?? [];
        const progressPercent = progressData?.progress ?? 0;

        res.json({
            success: true,
            jobId: job.id,
            state,
            progress: progressPercent,
            successCount,
            errorCount,
            failedQuestionIds,
            totalQuestions: job.data?.question_ids?.length || 0,
            logs: logs.slice(-50), // Send last 50 logs
            result,
            createdAt: job.timestamp,
            processedAt: job.processedOn,
            finishedAt: job.finishedOn,
            isRetry: job.data?.isRetry || false
        });

    } catch (error: any) {
        logger.error('Bulk AI Edit Status Controller error:', error);
        next(error);
    }
};

// Retry failed questions from a previous job
export const bulkAIEditRetryController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobId = String(req.params.jobId);
        const body: Partial<BulkEditRequest> = req.body;

        if (!jobId || jobId === 'undefined') {
            throw new AppError('Job ID is required', 400);
        }

        const queue = await getBulkAIEditQueue();
        const originalJob = await queue.getJob(jobId);

        if (!originalJob) {
            throw new AppError('Original job not found', 404);
        }

        const originalProgress = (originalJob.progress || {}) as BulkAIEditProgress;
        const originalResult = originalJob.data?.result || {};
        const failedQuestionIds = originalResult?.failedQuestionIds || originalProgress?.failedQuestionIds || [];

        if (!failedQuestionIds || failedQuestionIds.length === 0) {
            throw new AppError('No failed questions to retry in this job', 400);
        }

        // Get API key based on provider (use same provider as original or new one from body)
        const ai_provider = body.ai_provider || originalJob.data.ai_provider;
        const model = body.model || originalJob.data.model;

        let apiKey = '';
        switch (ai_provider) {
            case 'gemini':
                apiKey = process.env.GEMINI_API_KEY || '';
                break;
            case 'openai':
                apiKey = process.env.OPENAI_API_KEY || '';
                break;
            case 'claude':
                apiKey = process.env.CLAUDE_API_KEY || '';
                break;
            default:
                throw new AppError('Unsupported AI provider', 400);
        }

        if (!apiKey) {
            throw new AppError(`API key for ${ai_provider} not configured`, 500);
        }

        const retryJob = await queue.add('bulk-ai-edit-retry', {
            question_ids: failedQuestionIds,
            edit_type: originalJob.data.edit_type,
            action: originalJob.data.action,
            language: originalJob.data.language,
            custom_prompt: originalJob.data.custom_prompt,
            ai_provider,
            model,
            apiKey,
            isRetry: true,
            originalJobId: jobId,
            originalFailedIds: failedQuestionIds
        }, {
            attempts: 2,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        });

        logger.info(`Bulk AI Edit retry job ${retryJob.id} queued for ${failedQuestionIds.length} failed questions from job ${jobId}`);

        res.status(202).json({
            success: true,
            message: `Retry job queued for ${failedQuestionIds.length} failed questions`,
            jobId: retryJob.id,
            originalJobId: jobId,
            status: 'queued',
            retryCount: failedQuestionIds.length
        });

    } catch (error: any) {
        logger.error('Bulk AI Edit Retry Controller error:', error);
        next(error);
    }
};

// List recent bulk AI edit jobs
export const bulkAIEditListController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const queue = await getBulkAIEditQueue();
        const jobs = await queue.getJobs(['completed', 'failed', 'active', 'waiting'], offset, offset + limit);

        const formattedJobs = await Promise.all(jobs.map(async (job) => {
            const state = await job.getState();
            const progressData = (job.progress || {}) as BulkAIEditProgress;
            const result = job.data?.result || null;

            return {
                jobId: job.id,
                state,
                progress: progressData?.progress ?? 0,
                successCount: result?.successCount ?? progressData?.successCount ?? 0,
                errorCount: result?.errorCount ?? progressData?.errorCount ?? 0,
                failedQuestionIds: result?.failedQuestionIds ?? progressData?.failedQuestionIds ?? [],
                totalQuestions: job.data?.question_ids?.length || 0,
                isRetry: job.data?.isRetry || false,
                originalJobId: job.data?.originalJobId || null,
                createdAt: job.timestamp,
                finishedAt: job.finishedOn
            };
        }));

        res.json({
            success: true,
            jobs: formattedJobs,
            total: formattedJobs.length
        });

    } catch (error: any) {
        logger.error('Bulk AI Edit List Controller error:', error);
        next(error);
    }
};
