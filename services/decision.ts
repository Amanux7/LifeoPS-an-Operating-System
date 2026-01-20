import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';
import geminiService from './gemini';
import { Decision, CreateDecisionDTO, UpdateDecisionSynthesisDTO } from '../types/decision';
import pgvector from 'pgvector/pg';

export class DecisionService {
    /**
     * Initialize a new decision process
     */
    async createDecision(data: CreateDecisionDTO): Promise<Decision> {
        try {
            // Generate embedding for the question to enable semantic search later
            const embedding = await geminiService.getEmbedding(data.question);
            const embeddingVector = pgvector.toSql(embedding);

            const query = `
                INSERT INTO decisions (
                    id,
                    user_id,
                    question,
                    question_embedding,
                    synthesized_recommendation,
                    synthesis_reasoning,
                    metadata,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, '', '', $5, NOW(), NOW())
                RETURNING *
            `;

            const values = [
                uuidv4(),
                data.userId,
                data.question,
                embeddingVector,
                data.metadata || {}
            ];

            const result = await db.query<Decision>(query, values);
            return result[0];
        } catch (error) {
            console.error('Error creating decision:', error);
            throw error;
        }
    }

    /**
     * Add context memories to the decision
     */
    async addContext(decisionId: string, memoryIds: string[], summary?: string): Promise<void> {
        // This would typically involve appending to the array. 
        // Postgres array_append or just updating the whole set.
        try {
            let query = 'UPDATE decisions SET context_memory_ids = $2';
            const values: any[] = [decisionId, memoryIds];

            if (summary) {
                query += ', context_summary = $3';
                values.push(summary);
            }

            query += ', updated_at = NOW() WHERE id = $1';

            await db.query(query, values);
        } catch (error) {
            console.error('Error adding context to decision:', error);
            throw error;
        }
    }

    /**
     * Record an agent's contribution to the decision
     */
    async recordAgentExecution(
        decisionId: string,
        agentId: string,
        agentName: string,
        input: any,
        output: any
    ): Promise<void> {
        try {
            // We need to fetch the current list, append, and save back 
            // OR use jsonb_insert. jsonb_insert is cleaner but let's stick to simple logic for now.
            // Actually, let's use a specialized query if possible.
            // decisions.agents_consulted is JSONB array.

            const newEntry = {
                agentId,
                agentName,
                input,
                output,
                timestamp: new Date().toISOString()
            };

            const query = `
                UPDATE decisions 
                SET agents_consulted = agents_consulted || $2::jsonb,
                    updated_at = NOW()
                WHERE id = $1
            `;

            await db.query(query, [decisionId, JSON.stringify([newEntry])]);

        } catch (error) {
            console.error('Error recording agent execution:', error);
            throw error;
        }
    }

    /**
     * Finalize the decision with a synthesis
     */
    async updateSynthesis(decisionId: string, synthesis: UpdateDecisionSynthesisDTO): Promise<Decision> {
        try {
            const query = `
                UPDATE decisions SET
                    synthesized_recommendation = $2,
                    synthesis_reasoning = $3,
                    risk_factors = $4,
                    alternatives = $5,
                    overall_confidence = $6,
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `;

            const values = [
                decisionId,
                synthesis.recommendation,
                synthesis.reasoning,
                synthesis.risks,
                synthesis.alternatives,
                synthesis.confidence
            ];

            const result = await db.query<Decision>(query, values);
            return result[0];
        } catch (error) {
            console.error('Error updating synthesis:', error);
            throw error;
        }
    }

    /**
     * Get a decision by ID
     */
    async getDecision(id: string): Promise<Decision | null> {
        const query = 'SELECT * FROM decisions WHERE id = $1';
        const result = await db.query<Decision>(query, [id]);
        return result[0] || null;
    }
}

export const decisionService = new DecisionService();
export default decisionService;
