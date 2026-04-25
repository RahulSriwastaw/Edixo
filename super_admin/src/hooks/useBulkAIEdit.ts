import { useState, useCallback, useEffect, useRef } from 'react';

export interface EditLog {
    status: 'pending' | 'processing' | 'success' | 'error' | 'completed';
    question_id: string;
    index: number;
    total: number;
    message: string;
    error?: string;
}

export interface BulkEditConfig {
    question_ids: string[];
    edit_type: 'question_variation' | 'language_variation' | 'solution_add' | 'custom';
    action?: string;
    language?: string;
    custom_prompt?: string;
    ai_provider: 'gemini' | 'openai' | 'claude' | 'ollama';
    model: string;
}

export interface JobStatus {
    jobId: string;
    state: string;
    progress: number;
    successCount: number;
    errorCount: number;
    failedQuestionIds: string[];
    totalQuestions: number;
    logs: EditLog[];
    isRetry: boolean;
    originalJobId?: string;
}

interface UseBulkAIEditReturn {
    logs: EditLog[];
    isProcessing: boolean;
    progress: number;
    successCount: number;
    errorCount: number;
    jobId: string | null;
    jobStatus: JobStatus | null;
    failedQuestionIds: string[];
    mode: 'sse' | 'background';
    setMode: (mode: 'sse' | 'background') => void;
    startProcessing: (config: BulkEditConfig) => void;
    stopProcessing: () => void;
    clearLogs: () => void;
    retryFailed: () => void;
    canRetry: boolean;
    isRetrying: boolean;
}

function getApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
}

function getToken(): string {
    if (typeof window === 'undefined') return '';
    return document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/)?.[1] || '';
}

export function useBulkAIEdit(): UseBulkAIEditReturn {
    const [logs, setLogs] = useState<EditLog[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
    const [failedQuestionIds, setFailedQuestionIds] = useState<string[]>([]);
    const [mode, setMode] = useState<'sse' | 'background'>('sse');
    const [isRetrying, setIsRetrying] = useState(false);
    const [lastConfig, setLastConfig] = useState<BulkEditConfig | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearLogs = useCallback(() => {
        setLogs([]);
        setProgress(0);
        setSuccessCount(0);
        setErrorCount(0);
        setJobId(null);
        setJobStatus(null);
        setFailedQuestionIds([]);
        setIsRetrying(false);
    }, []);

    const stopProcessing = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        setIsProcessing(false);
    }, []);

    const pollJobStatus = useCallback(async (jid: string) => {
        try {
            const apiUrl = getApiUrl();
            const token = getToken();

            const response = await fetch(`${apiUrl}/questions/bulk-ai-edit/jobs/${jid}/status`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!response.ok) return;

            const data = await response.json();
            if (!data.success) return;

            const status: JobStatus = data;
            setJobStatus(status);
            setProgress(status.progress);
            setSuccessCount(status.successCount);
            setErrorCount(status.errorCount);
            setFailedQuestionIds(status.failedQuestionIds || []);

            if (status.logs && status.logs.length > 0) {
                setLogs(prev => {
                    const existingIds = new Set(prev.map(l => `${l.index}-${l.status}-${l.message}`));
                    const newLogs = status.logs.filter((l: EditLog) => !existingIds.has(`${l.index}-${l.status}-${l.message}`));
                    return [...prev, ...newLogs];
                });
            }

            if (status.state === 'completed' || status.state === 'failed') {
                setIsProcessing(false);
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
            }
        } catch (err) {
            console.error('Error polling job status:', err);
        }
    }, []);

    const startBackgroundJob = useCallback(async (config: BulkEditConfig) => {
        clearLogs();
        setIsProcessing(true);
        setLastConfig(config);

        try {
            const apiUrl = getApiUrl();
            const token = getToken();

            const response = await fetch(`${apiUrl}/questions/bulk-ai-edit/background`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error((errorData && errorData.message) || `HTTP error ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to queue job');
            }

            setJobId(data.jobId);
            setLogs([{
                status: 'pending',
                question_id: '',
                index: 0,
                total: config.question_ids.length,
                message: `Job queued (${data.jobId}). Processing ${config.question_ids.length} questions in background...`
            }]);

            // Start polling
            pollIntervalRef.current = setInterval(() => {
                pollJobStatus(data.jobId);
            }, 2000);

            // Immediate first poll
            pollJobStatus(data.jobId);

        } catch (error: any) {
            console.error('Error starting background job:', error);
            setLogs(prev => [...prev, {
                status: 'error',
                question_id: '',
                index: 0,
                total: config.question_ids.length,
                message: 'Failed to start background job',
                error: error.message
            }]);
            setIsProcessing(false);
        }
    }, [clearLogs, pollJobStatus]);

    const startSSE = useCallback(async (config: BulkEditConfig) => {
        clearLogs();
        setIsProcessing(true);
        setLastConfig(config);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const apiUrl = getApiUrl();
            const token = getToken();

            const response = await fetch(`${apiUrl}/questions/bulk-ai-edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(config),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error((errorData && errorData.message) || `HTTP error ${response.status}`);
            }

            if (!response.body) {
                throw new Error("ReadableStream not supported in this browser.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (!dataStr) continue;

                        try {
                            const log: EditLog = JSON.parse(dataStr);
                            setLogs(prevLogs => [...prevLogs, log]);

                            if (log.status === 'success') {
                                setSuccessCount(prev => prev + 1);
                                setProgress((log.index / log.total) * 100);
                            } else if (log.status === 'error') {
                                setErrorCount(prev => prev + 1);
                                setProgress((log.index / log.total) * 100);
                                if (log.question_id) {
                                    setFailedQuestionIds(prev => [...prev, log.question_id]);
                                }
                            } else if (log.status === 'processing') {
                                setProgress(((log.index - 1) / log.total) * 100);
                            } else if (log.status === 'completed') {
                                setProgress(100);
                                setIsProcessing(false);
                                abortControllerRef.current = null;
                            }
                        } catch (parseError) {
                            console.error('Failed to parse SSE message:', dataStr);
                        }
                    }
                }
            }

            // Flush remaining buffer
            if (buffer.trim()) {
                const dataStr = buffer.replace('data: ', '').trim();
                if (dataStr) {
                    try {
                        const log: EditLog = JSON.parse(dataStr);
                        setLogs(prevLogs => [...prevLogs, log]);
                    } catch (e) {}
                }
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error starting bulk AI edit:', error);
                setLogs(prevLogs => [...prevLogs, {
                    status: 'error',
                    question_id: '',
                    index: 0,
                    total: config.question_ids.length,
                    message: 'Execution failed',
                    error: error.message
                }]);
            } else {
                setLogs(prevLogs => [...prevLogs, {
                    status: 'error',
                    question_id: '',
                    index: 0,
                    total: 0,
                    message: 'Execution aborted'
                }]);
            }
            setIsProcessing(false);
            abortControllerRef.current = null;
        }
    }, [clearLogs]);

    const startProcessing = useCallback((config: BulkEditConfig) => {
        if (mode === 'background') {
            startBackgroundJob(config);
        } else {
            startSSE(config);
        }
    }, [mode, startBackgroundJob, startSSE]);

    const retryFailed = useCallback(async () => {
        if (!jobId || failedQuestionIds.length === 0) return;

        setIsRetrying(true);
        setLogs(prev => [...prev, {
            status: 'pending',
            question_id: '',
            index: 0,
            total: failedQuestionIds.length,
            message: `Retrying ${failedQuestionIds.length} failed questions...`
        }]);

        try {
            const apiUrl = getApiUrl();
            const token = getToken();

            const response = await fetch(`${apiUrl}/questions/bulk-ai-edit/jobs/${jobId}/retry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(lastConfig || {})
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error((errorData && errorData.message) || `HTTP error ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Retry failed');
            }

            setJobId(data.jobId);
            setFailedQuestionIds([]);

            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }

            pollIntervalRef.current = setInterval(() => {
                pollJobStatus(data.jobId);
            }, 2000);

            pollJobStatus(data.jobId);

        } catch (error: any) {
            console.error('Error retrying failed questions:', error);
            setLogs(prev => [...prev, {
                status: 'error',
                question_id: '',
                index: 0,
                total: failedQuestionIds.length,
                message: 'Retry failed',
                error: error.message
            }]);
        } finally {
            setIsRetrying(false);
        }
    }, [jobId, failedQuestionIds, lastConfig, pollJobStatus]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const canRetry = !isProcessing && failedQuestionIds.length > 0 && mode === 'background';

    return {
        logs,
        isProcessing,
        progress,
        successCount,
        errorCount,
        jobId,
        jobStatus,
        failedQuestionIds,
        mode,
        setMode,
        startProcessing,
        stopProcessing,
        clearLogs,
        retryFailed,
        canRetry,
        isRetrying
    };
}
