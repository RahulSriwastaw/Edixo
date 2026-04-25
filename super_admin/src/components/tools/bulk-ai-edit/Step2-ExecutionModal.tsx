"use client";

import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, CheckCircle2, AlertCircle, Circle, RefreshCw, Zap, Clock } from 'lucide-react';
import { AI_PROVIDERS, getDefaultModel, getModelsByProvider, EDIT_TYPES, LANGUAGE_VARIATION_ACTIONS, SOLUTION_ACTIONS, LANGUAGES } from '@/lib/ai-providers-config';
import { useBulkAIEdit, EditLog, BulkEditConfig } from '@/hooks/useBulkAIEdit';
import { Step1Config } from './Step1-ConfigModal';

interface Step2ExecutionModalProps {
    isOpen: boolean;
    selectedCount: number;
    questionIds: string[];
    config: Step1Config | null;
    onClose: () => void;
}

export function Step2ExecutionModal({ isOpen, selectedCount, questionIds, config, onClose }: Step2ExecutionModalProps) {
    const [provider, setProvider] = React.useState<'gemini' | 'openai' | 'claude' | 'ollama'>('gemini');
    const [model, setModel] = React.useState(getDefaultModel('gemini'));
    const [showCloseConfirm, setShowCloseConfirm] = React.useState(false);
    const [isMinimized, setIsMinimized] = React.useState(false);
    const [widgetPos, setWidgetPos] = React.useState({ x: 0, y: 0 });
    const [hasDragged, setHasDragged] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const logsEndRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);

    const {
        logs, isProcessing, progress, successCount, errorCount,
        jobId, jobStatus, failedQuestionIds, mode, setMode,
        startProcessing, stopProcessing, retryFailed, canRetry, isRetrying
    } = useBulkAIEdit();

    // Auto-scroll logs to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Update model when provider changes
    const handleProviderChange = (newProvider: any) => {
        setProvider(newProvider);
        const models = getModelsByProvider(newProvider);
        setModel(models[0]?.id || '');
    };

    const handleStartEdit = async () => {
        if (!config) return;

        const bulkConfig: BulkEditConfig = {
            question_ids: questionIds,
            edit_type: config.editType as any,
            action: config.action,
            language: config.language,
            custom_prompt: config.customPrompt,
            ai_provider: provider,
            model
        };

        startProcessing(bulkConfig);
    };

    const handleClose = () => {
        if (isProcessing && mode === 'sse') {
            // SSE mode: warn before closing since stream will be lost
            setShowCloseConfirm(true);
        } else if (isProcessing && mode === 'background') {
            // Background mode: allow minimize instead of close
            setIsMinimized(true);
        } else {
            onClose();
        }
    };

    const handleMinimizeToggle = () => {
        setIsMinimized(prev => !prev);
    };

    const handleForceClose = () => {
        stopProcessing();
        setIsMinimized(false);
        onClose();
    };

    // Draggable widget handlers
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
            dragOffset.current = {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }
    };

    React.useEffect(() => {
        if (!isDragging) return;
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const rect = widgetRef.current?.getBoundingClientRect();
            const w = rect?.width ?? 288;
            const h = rect?.height ?? 200;
            const maxX = window.innerWidth - w;
            const maxY = window.innerHeight - h;
            let newX = clientX - dragOffset.current.x;
            let newY = clientY - dragOffset.current.y;
            if (newX < 0) newX = 0;
            if (newX > maxX) newX = maxX;
            if (newY < 0) newY = 0;
            if (newY > maxY) newY = maxY;
            setHasDragged(true);
            setWidgetPos({ x: newX, y: newY });
        };
        const handleEnd = () => setIsDragging(false);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    const getEditTypeLabel = (editTypeId: string) => {
        return EDIT_TYPES.find(t => t.id === editTypeId)?.name || editTypeId;
    };

    const getActionLabel = (actionId: string) => {
        if (config?.editType === 'language_variation') {
            return LANGUAGE_VARIATION_ACTIONS.find(a => a.id === actionId)?.name || actionId;
        }
        if (config?.editType === 'solution_add') {
            return SOLUTION_ACTIONS.find(a => a.id === actionId)?.name || actionId;
        }
        return actionId;
    };

    const statusDotColor = isProcessing ? 'bg-green-500' : logs.length > 0 && (errorCount > 0) ? 'bg-red-500' : 'bg-gray-500';

    const getJobStateBadgeVariant = (state: string) => {
        switch (state) {
            case 'completed': return 'success';
            case 'failed': return 'destructive';
            case 'processing': return 'default';
            case 'pending': return 'secondary';
            default: return 'outline';
        }
    };

    const models = getModelsByProvider(provider);

    return (
        <>
            <Dialog open={isOpen && !isMinimized} onOpenChange={handleClose}>
                <DialogContent showCloseButton={false} className="max-w-[100vw] sm:max-w-full w-full h-[100dvh] max-h-screen p-0 m-0 rounded-none border-0 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 md:p-4 border-b bg-white shrink-0">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600 hidden sm:block" />
                            <div>
                                <DialogTitle className="text-base md:text-lg font-semibold">Bulk AI Edit</DialogTitle>
                                <p className="text-xs md:text-sm text-gray-500">Processing {selectedCount} selected questions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white min-w-[max-content]"
                                onClick={handleStartEdit}
                                disabled={isProcessing || logs.length > 0}
                            >
                                <Sparkles className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Start Bulk AI Edit</span>
                                <span className="md:hidden">Start</span>
                            </Button>
                            <button
                                onClick={handleClose}
                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content - Responsive 2 Column Layout */}
                    <div className="flex flex-col md:flex-row gap-4 p-4 flex-1 overflow-hidden bg-gray-50/30">
                        {/* LEFT PANEL - AI Configuration (30%) */}
                        <div className="w-full md:w-[30%] lg:w-[25%] overflow-y-auto space-y-5 md:pr-2 shrink-0 max-h-[40vh] md:max-h-full pb-4">
                            {/* AI Configuration Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900">AI CONFIGURATION</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="provider">AI PROVIDER</Label>
                                    <Select value={provider} onValueChange={handleProviderChange}>
                                        <SelectTrigger id="provider">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AI_PROVIDERS.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="model">MODEL</Label>
                                    <Select value={model} onValueChange={setModel}>
                                        <SelectTrigger id="model">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {models.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    <div className="flex flex-col">
                                                        <span>{m.name}</span>
                                                        {m.description && <span className="text-xs text-gray-500">{m.description}</span>}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Processing Mode Toggle */}
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="processing-mode" className="cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                {mode === 'background' ? <Clock className="w-3.5 h-3.5 text-blue-500" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                                                <span>{mode === 'background' ? 'Background' : 'Real-time'} Mode</span>
                                            </div>
                                        </Label>
                                        <Switch
                                            id="processing-mode"
                                            checked={mode === 'background'}
                                            onCheckedChange={(checked) => setMode(checked ? 'background' : 'sse')}
                                            disabled={isProcessing || logs.length > 0}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        {mode === 'background'
                                            ? 'Runs in background. You can close this window and check progress later.'
                                            : 'Watch real-time progress with live logs. Window must stay open.'}
                                    </p>
                                </div>
                            </div>

                            {/* Edit Settings Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900">EDIT SETTINGS</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="editType">EDIT TYPE</Label>
                                    <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                        {getEditTypeLabel(config?.editType || '')}
                                    </div>
                                </div>

                                {config?.action && (
                                    <div className="space-y-2">
                                        <Label htmlFor="action">ACTION</Label>
                                        <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                            {getActionLabel(config.action)}
                                        </div>
                                    </div>
                                )}

                                {config?.language && (
                                    <div className="space-y-2">
                                        <Label htmlFor="language">LANGUAGE</Label>
                                        <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                            {config.language}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Custom Prompt Section */}
                            {config?.customPrompt && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">CUSTOM PROMPT</h3>
                                    <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700 max-h-24 overflow-y-auto">
                                        {config.customPrompt}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT PANEL - Execution Status & Logs (70%) */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            {/* Execution Status */}
                            <div className="space-y-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">EXECUTION STATUS</h3>
                                <div className="space-y-2">
                                    <div className="text-sm flex items-center gap-2 flex-wrap">
                                        {isProcessing ? (
                                            <>
                                                <span className="text-green-600 font-medium">Processing...</span>
                                                {mode === 'background' && jobStatus && (
                                                    <Badge variant={getJobStateBadgeVariant(jobStatus.state)}>
                                                        {jobStatus.state}
                                                    </Badge>
                                                )}
                                            </>
                                        ) : isRetrying ? (
                                            <span className="text-amber-600 font-medium">Retrying failed questions...</span>
                                        ) : logs.length === 0 ? (
                                            <span className="text-gray-500">Ready to start</span>
                                        ) : (
                                            <span className="text-gray-700">
                                                Completed: <span className="text-green-600 font-medium">{successCount} success</span>, <span className="text-red-600 font-medium">{errorCount} failed</span>
                                                {mode === 'background' && jobStatus?.isRetry && (
                                                    <Badge variant="outline" className="ml-1 text-[10px]">Retry</Badge>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Background Job Info */}
                                    {mode === 'background' && jobId && (
                                        <div className="text-[11px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            Job ID: {jobId}
                                            {jobStatus?.originalJobId && (
                                                <span className="text-gray-400 ml-1">(from {jobStatus.originalJobId})</span>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-600">Progress</span>
                                            <span className="text-xs font-semibold text-gray-900">{Math.round(progress)}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Activity Logs */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900">REAL-TIME ACTIVITY LOGS</h3>
                                    <Circle className={`w-2 h-2 ${statusDotColor}`} />
                                </div>

                                <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-3 font-mono text-xs">
                                    {logs.length === 0 ? (
                                        <div className="text-gray-500">Waiting for execution to start...</div>
                                    ) : (
                                        logs.map((log, idx) => (
                                            <div key={idx} className={`mb-1 ${
                                                log.status === 'error' ? 'text-red-400' :
                                                log.status === 'success' ? 'text-green-400' :
                                                log.status === 'completed' ? 'text-green-300' :
                                                'text-gray-300'
                                            }`}>
                                                {log.status === 'success' && '✓ '}
                                                {log.status === 'error' && '✗ '}
                                                {log.message}
                                                {log.error && ` - ${log.error}`}
                                            </div>
                                        ))
                                    )}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex items-center justify-between p-3 md:p-4 border-t bg-white shrink-0">
                        <div className="text-xs md:text-sm text-gray-600">
                            {isProcessing ? (
                                `Processing ${Math.ceil((progress / 100) * selectedCount)}/${selectedCount}...`
                            ) : isRetrying ? (
                                `Retrying ${failedQuestionIds.length} failed questions...`
                            ) : logs.length > 0 ? (
                                `Completed: ${successCount} success, ${errorCount} failed`
                            ) : (
                                'Ready to process questions'
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Minimize Button - Background Mode */}
                            {isProcessing && mode === 'background' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMinimizeToggle}
                                >
                                    Minimize to Background
                                </Button>
                            )}
                            {/* Retry Button */}
                            {canRetry && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={retryFailed}
                                    disabled={isRetrying}
                                    className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
                                    Retry Failed ({failedQuestionIds.length})
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Minimized Floating Widget - Background Mode Only */}
            {isMinimized && (
                <div
                    ref={widgetRef}
                    className="fixed z-50 w-72 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden select-none"
                    style={{
                        left: hasDragged ? widgetPos.x : undefined,
                        top: hasDragged ? widgetPos.y : undefined,
                        right: hasDragged ? undefined : 16,
                        bottom: hasDragged ? undefined : 16,
                        cursor: isDragging ? 'grabbing' : 'default'
                    }}
                >
                    <div
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white cursor-grab active:cursor-grabbing"
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    >
                        <div className="flex items-center gap-2 pointer-events-none">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Background Job</span>
                        </div>
                        <div className="flex items-center gap-1 pointer-events-auto">
                            <button
                                onClick={handleMinimizeToggle}
                                className="p-1 hover:bg-white/20 rounded"
                                title="Expand"
                            >
                                <span className="text-lg leading-none">□</span>
                            </button>
                            <button
                                onClick={handleForceClose}
                                className="p-1 hover:bg-white/20 rounded"
                                title="Stop and close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Job ID</span>
                            <span className="font-mono text-gray-800">{jobId || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Status</span>
                            {jobStatus ? (
                                <Badge variant={getJobStateBadgeVariant(jobStatus.state)} className="text-[10px]">
                                    {jobStatus.state}
                                </Badge>
                            ) : (
                                <span className="text-gray-500">Pending</span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                            <span>{successCount} success</span>
                            <span>{errorCount} failed</span>
                        </div>
                        {/* Retry from minimized */}
                        {canRetry && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={retryFailed}
                                disabled={isRetrying}
                                className="w-full mt-1 border-amber-200 text-amber-700 hover:bg-amber-50 text-xs"
                            >
                                <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                                Retry Failed ({failedQuestionIds.length})
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Close Confirmation Dialog */}
            <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
                <AlertDialogContent>
                    <AlertDialogTitle>Processing in progress</AlertDialogTitle>
                    <AlertDialogDescription>
                        Real-time processing is ongoing. Closing will stop the current operation. Changes already applied will not be reverted.
                    </AlertDialogDescription>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Continue processing</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                stopProcessing();
                                onClose();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Close anyway
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
