import { AIService } from './modules/ai/ai.service';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testNewModels() {
    console.log('--- Testing New Gemini Models ---');

    const testModels = [
        'gemini-3-flash-preview',
        'gemini-3.1-pro-preview',
        'gemini-pro-latest'
    ];

    for (const modelId of testModels) {
        console.log(`\nTesting Model: ${modelId}...`);
        try {
            const response = await AIService.processToolRequest({
                modelId: modelId,
                systemPrompt: 'You are a helpful assistant.',
                userPrompt: 'Say "Connection Successful" if you can hear me.'
            });
            console.log(`Response from ${modelId}:`, response);
        } catch (error: any) {
            console.error(`Error testing ${modelId}:`, error.message);
        }
    }
}

testNewModels().catch(console.error);
