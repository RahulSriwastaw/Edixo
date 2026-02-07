import { geminiService } from './geminiService';
import { replicateService } from './replicateService';
import { GenerateParams, Question } from '../types';

export type AIProvider = 'gemini' | 'replicate';

export interface AIModelConfig {
    provider: AIProvider;
    modelId: string;
    displayName: string;
}

export const availableModels: AIModelConfig[] = [
    { provider: 'gemini', modelId: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 (Latest)' },
    { provider: 'gemini', modelId: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro (Stable)' },
    { provider: 'gemini', modelId: 'gemini-3.0-pro-exp', displayName: 'Gemini 3.0 (Preview)' },
    { provider: 'replicate', modelId: 'xai/grok-2-1212', displayName: 'Grok 2 (Beta)' },
    { provider: 'replicate', modelId: 'xai/grok-4', displayName: 'Grok 4 (Alpha)' },
];

export const aiOrchestrator = {
    generateQuestions: async (params: GenerateParams, modelConfig: AIModelConfig): Promise<Question[]> => {
        console.log(`AI Orchestrator: Routing to ${modelConfig.provider} with model ${modelConfig.modelId}`);

        try {
            if (modelConfig.provider === 'gemini') {
                // For Gemini, we use the existing service which has its own fallback logic
                return await geminiService.generateQuestions(params, modelConfig.modelId);
            } else if (modelConfig.provider === 'replicate') {
                return await replicateService.generateQuestions(params, modelConfig.modelId);
            } else {
                throw new Error(`Unknown AI provider: ${modelConfig.provider}`);
            }
        } catch (error: any) {
            console.error(`AI Orchestrator Error (${modelConfig.displayName}):`, error);
            throw error;
        }
    },

    generateAnswer: async (
        question: string,
        options: { detailLevel: 'Brief' | 'Detailed' | 'Step-by-Step'; language: string },
        modelConfig: AIModelConfig
    ): Promise<any> => {
        console.log(`AI Orchestrator: Routing answer generation to ${modelConfig.provider}`);

        try {
            if (modelConfig.provider === 'gemini') {
                return await geminiService.generateAnswer(question, options);
            } else if (modelConfig.provider === 'replicate') {
                return await replicateService.generateAnswer(question, options, modelConfig.modelId);
            } else {
                throw new Error(`Unknown AI provider: ${modelConfig.provider}`);
            }
        } catch (error: any) {
            console.error(`AI Orchestrator Error (${modelConfig.displayName}):`, error);
            throw error;
        }
    },

    summarizeExplanation: async (text: string, modelConfig?: AIModelConfig): Promise<string> => {
        // Default to Gemini for simple summarization
        const config = modelConfig || availableModels[0];

        if (config.provider === 'gemini') {
            return await geminiService.summarizeExplanation(text);
        }
        // For now, fallback to Gemini for summarization even if other provider selected
        return await geminiService.summarizeExplanation(text);
    },

    suggestTopics: async (subject: string, modelConfig?: AIModelConfig): Promise<string[]> => {
        const config = modelConfig || availableModels[0];

        if (config.provider === 'gemini') {
            return await geminiService.suggestTopics(subject);
        }
        // Fallback to Gemini for topic suggestions
        return await geminiService.suggestTopics(subject);
    },

    generateBookStructure: async (
        title: string,
        subject: string,
        targetAudience: string,
        topics: string[],
        modelConfig?: AIModelConfig
    ): Promise<any> => {
        const config = modelConfig || availableModels[0];

        if (config.provider === 'gemini') {
            return await geminiService.generateBookStructure(title, subject, targetAudience, topics);
        }
        // Fallback to Gemini for book structure
        return await geminiService.generateBookStructure(title, subject, targetAudience, topics);
    },

    generateBookChapter: async (
        chapterTitle: string,
        sections: string[],
        audience: string,
        modelConfig?: AIModelConfig
    ): Promise<string> => {
        const config = modelConfig || availableModels[0];

        if (config.provider === 'gemini') {
            return await geminiService.generateBookChapter(chapterTitle, sections, audience);
        }
        // Fallback to Gemini for book chapters
        return await geminiService.generateBookChapter(chapterTitle, sections, audience);
    },

    refineContent: async (content: string, instruction: string, modelConfig?: AIModelConfig): Promise<string> => {
        const config = modelConfig || availableModels[0];

        if (config.provider === 'gemini') {
            return await geminiService.refineContent(content, instruction);
        }
        // Fallback to Gemini
        return await geminiService.refineContent(content, instruction);
    }
};
