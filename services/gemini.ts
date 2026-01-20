import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private embeddingModel: any;
    private chatModel: any;

    constructor() {
        if (!config.gemini.apiKey) {
            console.warn('⚠️ GEMINI_API_KEY is not set in environment variables!');
        }
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey || '');

        // Use v1beta to access newer models like gemini-1.5-flash
        this.embeddingModel = this.genAI.getGenerativeModel({
            model: config.gemini.embeddingModel,
            apiVersion: 'v1beta'
        } as any);

        this.chatModel = this.genAI.getGenerativeModel({
            model: config.gemini.chatModel,
            apiVersion: 'v1beta'
        } as any);

        console.log(`Gemini Service Initialized with Chat Model: ${config.gemini.chatModel}`);
    }

    /**
     * Generate an embedding vector for the given text.
     * Model: text-embedding-004
     * Dimensions: 768
     */
    async getEmbedding(text: string): Promise<number[]> {
        try {
            const result = await this.embeddingModel.embedContent(text.replace(/\n/g, ' '));
            return result.embedding.values;
        } catch (error) {
            console.error('Error generating Gemini embedding:', error);
            throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Get a chat completion for the given prompt.
     * Model: gemini-1.5-flash
     */
    async getCompletion(prompt: string): Promise<string> {
        try {
            const result = await this.chatModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error getting Gemini completion:', error);
            throw new Error(`Failed to get completion: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export const geminiService = new GeminiService();
export default geminiService;
