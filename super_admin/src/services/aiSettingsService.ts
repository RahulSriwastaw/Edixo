import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface AISettings {
    id: string;
    defaultTextModel: string;
    defaultImageModel: string;
    top5Models: string[];
    apiKeyGemini?: string;
    apiKeyOpenRouter?: string;
    apiKeyModal?: string;
    apiKeyClaude?: string;
    envStatus?: {
        gemini: boolean;
        openrouter: boolean;
        modal: boolean;
        claude: boolean;
    };
    updatedAt: string;
}

export const getAISettings = async (): Promise<AISettings> => {
    const response = await axios.get(`${API_URL}/ai/settings`);
    return response.data.data;
};

export const updateAISettings = async (data: Partial<AISettings>): Promise<AISettings> => {
    const response = await axios.post(`${API_URL}/ai/settings`, data);
    return response.data.data;
};
