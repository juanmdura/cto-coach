import { GoogleGenerativeAI } from '@google/generative-ai';
import { createError } from '../middleware/errorHandler';

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: unknown;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw createError('GEMINI_API_KEY environment variable is required', 500);
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(context: string): Promise<string> {
    try {
      const result = await this.model.generateContent(context);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw createError('Empty response from Gemini API', 500);
      }

      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Handle specific Gemini API errors
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw createError('Invalid Gemini API key', 401);
        }
        if (error.message.includes('quota')) {
          throw createError('Gemini API quota exceeded', 429);
        }
        if (error.message.includes('safety')) {
          throw createError('Content filtered by safety settings', 400);
        }
      }

      throw createError('Failed to generate AI response', 500);
    }
  }
}
