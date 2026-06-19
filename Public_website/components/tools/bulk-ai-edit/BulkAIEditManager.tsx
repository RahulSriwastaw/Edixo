"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Copy, Plus, Sparkles } from 'lucide-react';
import { Step1ConfigModal, Step1Config, Step2ExecutionModal } from './index';

interface BulkAIEditManagerProps {
    selectedQuestions: string[];
    onSelectionChange: (selected: string[]) => void;
    onEditComplete?: () => void;
    onBulkTag?: () => void;
    onCopyToTest?: () => void;
    onAddToQBank?: () => void;
}

export function BulkAIEditManager({ 
    selectedQuestions, 
    onSelectionChange, 
    onEditComplete,
    onBulkTag,
    onCopyToTest,
    onAddToQBank
}: BulkAIEditManagerProps) {
    const [showStep1, setShowStep1] = useState(false);
    const [showStep2, setShowStep2] = useState(false);
    const [step1Config, setStep1Config] = useState<Step1Config | null>(null);

    const handleBulkEditClick = () => {
        setShowStep1(true);
    };

    const handleStep1Next = (config: Step1Config) => {
        setStep1Config(config);
        setShowStep1(false);
        setShowStep2(true);
    };

    const handleStep2Close = () => {
        setShowStep2(false);
        // Optional: clear selection after completion
        // onSelectionChange([]);
        onEditComplete?.();
    };

    const handleClearSelection = () => {
        onSelectionChange([]);
    };

    if (selectedQuestions.length === 0) {
        return null;
    }

    return (
        <>
            {/* Selection Action Bar */}
            <div className="sticky top-0 z-40 bg-white border border-blue-200 shadow-md rounded-lg p-3 mb-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 px-2">
                        <span className="text-sm font-semibold text-blue-800">
                            {selectedQuestions.length} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onBulkTag}
                            className="text-xs border-blue-200 hover:bg-blue-50 text-blue-700"
                        >
                            Bulk Tag
                        </Button>

                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs border-0 shadow-sm"
                            onClick={handleBulkEditClick}
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Bulk Edit
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onCopyToTest}
                            className="text-xs"
                        >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy to Test
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onAddToQBank}
                            className="text-xs"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add to Q-Bank
                        </Button>

                        <div className="h-6 w-px bg-gray-200 mx-1" />

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleClearSelection}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Clear Selection
                        </Button>
                    </div>
                </div>
            </div>

            {/* Step 1: Configuration Modal */}
            <Step1ConfigModal
                isOpen={showStep1}
                selectedCount={selectedQuestions.length}
                onClose={() => setShowStep1(false)}
                onNext={handleStep1Next}
            />

            {/* Step 2: Execution Modal */}
            <Step2ExecutionModal
                isOpen={showStep2}
                selectedCount={selectedQuestions.length}
                questionIds={selectedQuestions}
                config={step1Config}
                onClose={handleStep2Close}
            />
        </>
    );
}
