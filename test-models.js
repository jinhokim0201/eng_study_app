import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Read .env manually
const envPath = path.join(process.cwd(), '.env');
let apiKey = '';

try {
    if (fs.existsSync(envPath)) {
        const buffer = fs.readFileSync(envPath);
        let envContent;
        if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
            envContent = buffer.toString('utf16le');
        } else {
            envContent = buffer.toString('utf8');
        }
        const lines = envContent.split(/\r?\n/);
        for (const line of lines) {
            if (line.trim().startsWith('VITE_GEMINI_API_KEY=')) {
                apiKey = line.split('=')[1].trim();
                break;
            }
        }
    }
} catch (e) {
    console.error('Error reading .env:', e);
}

if (!apiKey) {
    console.error('API Key not found in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log('Fetching available models...');
        // Note: listModels is not directly exposed on the main class in some versions, 
        // but let's try to use the model manager if available or just try a standard request.
        // Actually, for @google/generative-ai, we might not have a direct listModels method on the client instance easily accessible in all versions without using the model manager.
        // Let's try to just use a known working model 'gemini-1.5-flash' and print if it works.

        // But wait, the error says "Call ListModels to see the list of available models".
        // This suggests the API supports it.
        // The Node SDK might expose it via a different path.
        // Let's try to just run a simple generation with 'gemini-1.5-flash' and 'gemini-pro' and see which one works or fails.

        const modelsToTry = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro'];

        for (const modelName of modelsToTry) {
            console.log(`Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} works! Response: ${response.text()}`);
                return; // Found a working model
            } catch (error) {
                console.log(`FAILED: ${modelName} - ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
