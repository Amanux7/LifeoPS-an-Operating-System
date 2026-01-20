
import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';
import geminiService from './gemini';
import { Memory, CreateMemoryDTO, SearchMemoryDTO } from '../types/memory';
import pgvector from 'pgvector/pg';

export class MemoryService {
    /**
     * Create a new memory entry with embedding
     */
    async createMemory(data: CreateMemoryDTO): Promise<Memory> {
        try {
            // Generate embedding using Gemini
            const embedding = await geminiService.getEmbedding(data.content);
            const embeddingVector = pgvector.toSql(embedding);

            // Store tags in metadata since there is no tags column
            const metadata = {
                ...(data.metadata || {}),
                tags: data.tags || []
            };

            const query = `
                INSERT INTO memories(
    id,
    user_id,
    type,
    category,
    content,
    embedding,
    metadata,
    relevance_score,
    expires_at,
    created_at,
    updated_at,
    accessed_at
)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
RETURNING *
    `;

            const values = [
                uuidv4(),
                data.userId,
                data.type,
                data.category,
                data.content,
                embeddingVector,
                metadata,
                1.0, // Default relevance score
                data.expiresAt || null
            ];

            const result = await db.query<Memory>(query, values);
            return result[0];
        } catch (error) {
            console.error('Error creating memory:', error);
            throw error;
        }
    }

    /**
     * Search memories using semantic similarity
     */
    async searchMemories(search: SearchMemoryDTO): Promise<Memory[]> {
        try {
            const embedding = await geminiService.getEmbedding(search.query);
            const embeddingVector = pgvector.toSql(embedding);
            const limit = search.limit || 5;
            const threshold = search.threshold || 0.7; // Minimum similarity threshold (1 - distance)

            // Using cosine distance operator (<=>) provided by pgvector
            // 1 - (embedding <=> query) gives cosine similarity
            let query = `
SELECT *, 1 - (embedding <=> $1) as similarity
                FROM memories
                WHERE deleted_at IS NULL
            `;

            const values: any[] = [embeddingVector];
            let paramCount = 1;

            if (search.userId) {
                paramCount++;
                query += ` AND user_id = $${paramCount} `;
                values.push(search.userId);
            }

            if (search.type) {
                paramCount++;
                query += ` AND type = $${paramCount} `;
                values.push(search.type);
            }

            if (search.category) {
                paramCount++;
                query += ` AND category = $${paramCount} `;
                values.push(search.category);
            }

            if (search.tags && search.tags.length > 0) {
                // Search in metadata.tags
                // JSONB containment operator @>
                paramCount++;
                query += ` AND metadata @> $${paramCount} `;
                values.push({ tags: search.tags });
            }

            // Order by similarity and limit results
            query += ` ORDER BY similarity DESC LIMIT ${limit} `;

            const results = await db.query<Memory & { similarity: number }>(query, values);

            // Filter results in application layer if needed, though mostly handled by query limit
            // Note: Postgres pgvector index search is approximate nearest neighbor
            return results.filter(m => m.similarity >= threshold);

        } catch (error) {
            console.error('Error searching memories:', error);
            throw error;
        }
    }

    /**
     * Get recent memories
     */
    async getRecentMemories(userId: string, limit: number = 10): Promise<Memory[]> {
        const query = `
SELECT * FROM memories
            WHERE user_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT $2
    `;
        return db.query<Memory>(query, [userId, limit]);
    }
}

export const memoryService = new MemoryService();
export default memoryService;
