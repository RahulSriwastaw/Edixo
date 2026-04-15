import { AIService } from './modules/ai/ai.service';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function reproduce() {
    console.log('--- Reproducing 500 Error ---');
    try {
        // Mock a tool request with a KEY (like the frontend sends)
        const result = await AIService.processToolRequest({
            modelId: 'GEMINI_3_1_PRO_PREVIEW',
            systemPrompt: 'You are a helpful assistant.',
            userPrompt: 'Hello'
        });
        console.log('Result:', result);
    } catch (error: any) {
        console.error('Caught Error:', error.message);
    }
}

reproduce().catch(console.error);
