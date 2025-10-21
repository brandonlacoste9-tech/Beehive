import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (genAI) return genAI;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY');
  }
  genAI = new GoogleGenerativeAI(key);
  return genAI;
}

export async function runGeminiPrompt(systemPrompt: string, userInput: string) {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const prompt = `${systemPrompt}\n\n${userInput}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

export function resetGeminiForTests() {
  genAI = null;
}
