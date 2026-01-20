import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface Config {
    env: string;
    database: {
        url: string;
    };
    openai: {
        apiKey: string;
        chatModel: string;
        embeddingModel: string;
    };
    gemini: {
        apiKey: string;
        chatModel: string;
        embeddingModel: string;
    };
    logging: {
        level: string;
    };
}

export const config: Config = {
    env: process.env.NODE_ENV || 'development',
    database: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lifeops_dev',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        chatModel: 'gpt-3.5-turbo', // Changed from 'model' to 'chatModel' and updated value
        embeddingModel: 'text-embedding-ada-002',
    },
    gemini: { // Added gemini object
        apiKey: process.env.GEMINI_API_KEY || '',
        embeddingModel: 'text-embedding-004',
        chatModel: 'gemini-flash-latest',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
};

// Validate required config
if (!config.openai.apiKey) {
    console.warn('⚠️  OPENAI_API_KEY not set in environment variables');
}

export default config;
