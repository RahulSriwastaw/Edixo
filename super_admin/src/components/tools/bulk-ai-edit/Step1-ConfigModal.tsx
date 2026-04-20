"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Sparkles } from 'lucide-react';
import {
    EDIT_TYPES,
    LANGUAGE_VARIATION_ACTIONS,
    SOLUTION_ACTIONS,
    LANGUAGES
} from '@/lib/ai-providers-config';

interface Step1ConfigModalProps {
    isOpen: boolean;
    selectedCount: number;
    onClose: () => void;
    onNext: (config: Step1Config) => void;
}

export interface Step1Config {
    editType: string;
    action?: string;
    language?: string;
    customPrompt?: string;
}

export function Step1ConfigModal({ isOpen, selectedCount, onClose, onNext }: Step1ConfigModalProps) {
    const [editType, setEditType] = useState('');
    const [action, setAction] = useState('');
    const [language, setLanguage] = useState('Hindi');
    const [customPrompt, setCustomPrompt] = useState('');

    const handleNext = () => {
        if (!editType) {
            alert('Please select an edit type');
            return;
        }

        onNext({
            editType,
            action: action || undefined,
            language: language || undefined,
            customPrompt: customPrompt || undefined
        });
    };

    const resetAfterClose = () => {
        setEditType('');
        setAction('');
        setLanguage('Hindi');
        setCustomPrompt('');
        onClose();
    };

    const getActionOptions = () => {
        if (editType === 'language_variation') return LANGUAGE_VARIATION_ACTIONS;
        if (editType === 'solution_add') return SOLUTION_ACTIONS;
        return [];
    };

    const showActionDropdown = editType === 'language_variation' || editType === 'solution_add';
    const showLanguageDropdown = editType === 'language_variation' && action === 'translate_fully';
    const showCustomPrompt = editType === 'custom';

    const getPreviewPrompt = () => {
        if (editType === 'question_variation') {
            return 'Generate a variation of this question keeping the same concept and difficulty.';
        }
        if (editType === 'language_variation' && action === 'make_bilingual') {
            return 'Make this question bilingual by adding a Hindi translation alongside the existing content.';
        }
        if (editType === 'solution_add') {
            if (action === 'add_solution_missing') return 'Create a clear, step-by-step solution for this MCQ.';
            if (action === 'make_detailed') return 'Expand the solution with more detailed explanation.';
            if (action === 'make_crisp') return 'Convert solution to bullet points format.';
        }
        return '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={resetAfterClose}>
            <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <DialogTitle>Bulk AI Edit</DialogTitle>
                    </div>
                    <DialogDescription>
                        Apply an AI-powered edit to {selectedCount} selected questions in parallel
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Edit Type Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                            <span className="text-red-500">✦</span> Edit Type
                        </Label>
                        <Select value={editType} onValueChange={setEditType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an edit type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {EDIT_TYPES.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{type.name}</span>
                                            <span className="text-xs text-gray-500">{type.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Selection (conditional) */}
                    {showActionDropdown && (
                        <div className="space-y-2">
                            <Label>Action</Label>
                            <Select value={action} onValueChange={setAction}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an action..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {getActionOptions().map((opt) => (
                                        <SelectItem key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Language Selection (conditional) */}
                    {showLanguageDropdown && (
                        <div className="space-y-2">
                            <Label>Target Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select language..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Language Variation Info */}
                    {editType === 'language_variation' && action === 'make_bilingual' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                            <p>The 2nd language is added alongside the original. In the solution, the Hindi translation starts after the full original solution.</p>
                        </div>
                    )}

                    {/* AI Instruction Preview */}
                    {!showCustomPrompt && getPreviewPrompt() && (
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-600">AI INSTRUCTION PREVIEW</Label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-700">
                                {getPreviewPrompt()}
                            </div>
                        </div>
                    )}

                    {/* Custom Prompt */}
                    {showCustomPrompt && (
                        <div className="space-y-2">
                            <Label htmlFor="custom-prompt">Custom Prompt</Label>
                            <Textarea
                                id="custom-prompt"
                                placeholder="Describe what you want AI to do to each question... (e.g., 'Fix grammatical errors in the questions and options')"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                className="min-h-24"
                            />
                            <p className="text-xs text-gray-500">This instruction will be applied to every question individually using AI. Be as specific as possible.</p>
                        </div>
                    )}

                    {/* Warning Box */}
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                            <p className="font-medium">Warning: This will modify {selectedCount} selected questions.</p>
                            <p className="text-xs mt-1">Changes are applied immediately and use AI credits.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={resetAfterClose}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                        onClick={handleNext}
                        disabled={!editType}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Bulk Edit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
