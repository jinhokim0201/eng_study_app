import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(request, response) {
    // CORS configuration
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return response.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    try {
        const { prompt } = request.body;

        if (!prompt) {
            return response.status(400).json({ error: 'Prompt is required' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const text = aiResponse.text();

        return response.status(200).json({ text });
    } catch (error) {
        console.error('Error in Vercel function:', error);
        return response.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
