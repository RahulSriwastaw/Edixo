export const AI_MODELS = {
    // OpenRouter (Free / High Performance Text)
    OPENROUTER_GEMMA_3_4B: { provider: 'openrouter', id: 'google/gemma-3-4b-it:free' },
    OPENROUTER_GEMMA_3_12B: { provider: 'openrouter', id: 'google/gemma-3-12b-it:free' },
    OPENROUTER_GEMMA_3_27B: { provider: 'openrouter', id: 'google/gemma-3-27b-it:free' },
    OPENROUTER_GEMMA_4_26B: { provider: 'openrouter', id: 'google/gemma-4-26b-a4b-it:free' },
    OPENROUTER_GEMMA_4_31B: { provider: 'openrouter', id: 'google/gemma-4-31b-it:free' },
    OPENROUTER_NEMOTRON_VIS: { provider: 'openrouter', id: 'nvidia/nemotron-nano-12b-v2-vl:free' },

    // Modal (Specialized Text/Research)
    MODAL_GLM_5_1: { provider: 'modal', id: 'zai-org/GLM-5.1-FP8' },

    // Gemini (Native Google API for high-res OCR / Visuals)
    GEMINI_1_5_FLASH: { provider: 'gemini', id: 'gemini-1.5-flash' },
    GEMINI_1_5_PRO: { provider: 'gemini', id: 'gemini-1.5-pro' },
    GEMINI_2_0_FLASH: { provider: 'gemini', id: 'gemini-2.0-flash' }
};

export const AI_ENDPOINTS = {
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    modal: 'https://api.us-west-2.modal.direct/v1/chat/completions'
};
