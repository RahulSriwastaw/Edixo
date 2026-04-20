import { useState, useCallback, useEffect } from 'react';

export interface EditLog {
    status: 'pending' | 'processing' | 'success' | 'error' | 'completed';
    question_id: string;
    index: number;
    total: number;
    message: string;
    error?: string;
}

interface UseBulkAIEditReturn {
    logs: EditLog[];
    isProcessing: boolean;
    progress: number;
    successCount: number;
    errorCount: number;
    startProcessing: (config: BulkEditConfig) => void;
    stopProcessing: () => void;
    clearLogs: () => void;
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

export function useBulkAIEdit(): UseBulkAIEditReturn {
    const [logs, setLogs] = useState<EditLog[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const clearLogs = useCallback(() => {
        setLogs([]);
        setProgress(0);
        setSuccessCount(0);
        setErrorCount(0);
    }, []);

    const stopProcessing = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
        setIsProcessing(false);
    }, [abortController]);

    const startProcessing = useCallback(async (config: BulkEditConfig) => {
        if (isProcessing) return;

        clearLogs();
        setIsProcessing(true);
        setProgress(0);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const token = typeof window !== 'undefined' ? 
                document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/)?.[1] : '';

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
                
                // Keep the last part in buffer if it's incomplete
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
                            } else if (log.status === 'completed') {
                                setProgress(100);
                                setIsProcessing(false);
                                setAbortController(null);
                            }
                        } catch (parseError) {
                            console.error('Failed to parse SSE message:', dataStr);
                        }
                    }
                }
            }

            // Flush the remaining buffer if any
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
                    total: 0,
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
            setAbortController(null);
        }
    }, [isProcessing, clearLogs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortController) {
                abortController.abort();
            }
        };
    }, [abortController]);

    return {
        logs,
        isProcessing,
        progress,
        successCount,
        errorCount,
        startProcessing,
        stopProcessing,
        clearLogs
    };
}
