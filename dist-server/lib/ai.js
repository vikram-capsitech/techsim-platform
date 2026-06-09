"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAI = callAI;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const generative_ai_1 = require("@google/generative-ai");
async function callAI(userPrompt, systemPrompt, maxTokens = 1000, customGroqKey, customGeminiKey) {
    const groqKey = customGroqKey || process.env.GROQ_API_KEY;
    const geminiKey = customGeminiKey || process.env.GEMINI_API_KEY;
    if (!groqKey && !geminiKey) {
        throw new Error('No Groq or Gemini API key configured on server or client');
    }
    // Try Groq first if key is available
    if (groqKey) {
        try {
            const groqClient = new groq_sdk_1.default({ apiKey: groqKey });
            const completion = await groqClient.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                max_tokens: maxTokens,
                temperature: 0.3,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            });
            return completion.choices[0].message.content || '';
        }
        catch (groqError) {
            console.warn('Groq failed, trying Gemini fallback:', groqError);
        }
    }
    // Gemini fallback
    if (geminiKey) {
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: systemPrompt
            });
            const result = await model.generateContent(userPrompt);
            return result.response.text();
        }
        catch (geminiError) {
            console.error('Gemini fallback failed:', geminiError);
            throw new Error('All AI providers failed');
        }
    }
    throw new Error('No Groq or Gemini API key configured on server or client');
}
