/**
 * AI Provider Configuration
 * Defines available AI providers and their models
 */

export interface AIModel {
    id: string;
    name: string;
    description?: string;
}

export interface AIProvider {
    id: 'gemini' | 'openai' | 'claude' | 'ollama';
    name: string;
    models: AIModel[];
}

export const AI_PROVIDERS: AIProvider[] = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        models: [
            { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', description: 'Fastest, best for real-time' },
            { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', description: 'Most capable for complex tasks' },
            { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', description: 'Latest standard flash model' },
            { id: 'gemini-2-flash', name: 'Gemini 2 Flash', description: 'Balanced speed & quality' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High-performance reasoning' }
        ]
    },
    {
        id: 'openai',
        name: 'OpenAI',
        models: [
            { id: 'gpt-4o', name: 'GPT-4 Omni', description: 'Latest, most capable model' },
            { id: 'gpt-4o-mini', name: 'GPT-4 Omni Mini', description: 'Fast and efficient' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Enhanced reasoning' }
        ]
    },
    {
        id: 'claude',
        name: 'Anthropic Claude',
        models: [
            { id: 'claude-opus-latest', name: 'Claude 3.7 Opus', description: 'Most powerful' },
            { id: 'claude-sonnet-latest', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
            { id: 'claude-haiku-latest', name: 'Claude 3 Haiku', description: 'Fast and compact' }
        ]
    }
];

export const EDIT_TYPES = [
    { id: 'question_variation', name: 'Question Variation', description: 'Generate variations with same concept' },
    { id: 'language_variation', name: 'Language Variation', description: 'Make bilingual or translate' },
    { id: 'solution_add', name: 'Solution Add / Change', description: 'Add or modify solutions' },
    { id: 'custom', name: 'Custom Prompt', description: 'Write your own AI instruction' }
];

export const LANGUAGE_VARIATION_ACTIONS = [
    { id: 'make_bilingual', name: 'Make bilingual (add 2nd language)' },
    { id: 'translate_fully', name: 'Translate fully to another language' }
];

export const SOLUTION_ACTIONS = [
    { id: 'add_solution_missing', name: 'Add solution where missing' },
    { id: 'make_detailed', name: 'Make solutions more detailed' },
    { id: 'make_crisp', name: 'Make solutions short & crisp (bullet points)' }
];

export const LANGUAGES = [
    'English',
    'Hindi',
    'Bengali',
    'Tamil',
    'Telugu',
    'Marathi',
    'Gujarati',
    'Kannada',
    'Malayalam',
    'Punjabi',
    'Urdu'
];

export function getModelsByProvider(providerId: 'gemini' | 'openai' | 'claude' | 'ollama'): AIModel[] {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    return provider?.models || [];
}

export function getDefaultModel(providerId: 'gemini' | 'openai' | 'claude' | 'ollama'): string {
    const models = getModelsByProvider(providerId);
    return models[0]?.id || '';
}
