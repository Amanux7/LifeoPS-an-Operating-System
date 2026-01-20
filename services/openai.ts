import OpenAI from 'openai';
import config from '../config';

export class OpenAIService {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: config.openai.apiKey,
        });
    }

    /**
     * Generate an embedding vector for the given text
     */
    async getEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model: config.openai.embeddingModel,
                input: text.replace(/\n/g, ' '), // Normalize text
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Get a chat completion completion from OpenAI
     */
    async getCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: config.openai.model,
                messages,
                temperature: 0.7,
            });

            return response.choices[0].message.content || '';
        } catch (error) {
            console.error('Error getting completion:', error);
            throw new Error(`Failed to get completion: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

// Singleton instance
export const openaiService = new OpenAIService();
export default openaiService;
