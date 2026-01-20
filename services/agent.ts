import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';
import { Agent, CreateAgentDTO } from '../types/agent';

export class AgentService {
    /**
     * Create or update an agent definition in the database
     */
    async createAgent(data: CreateAgentDTO): Promise<Agent> {
        try {
            // Check if agent with slug exists
            const existing = await this.getAgentBySlug(data.slug);

            const capabilitiesJson = JSON.stringify(data.capabilities);
            const configJson = JSON.stringify({
                enabled: true,
                timeout: 30000,
                maxRetries: 3,
                priority: 1,
                ...data.config
            });
            const metadataJson = JSON.stringify(data.metadata || {});

            let query = '';
            let values: any[] = [];

            if (existing) {
                // Update existing
                query = `
                    UPDATE agents SET
                        name = $2,
                        description = $3,
                        version = $4,
                        capabilities = $5,
                        config = $6,
                        metadata = $7,
                        updated_at = NOW()
                    WHERE slug = $1
                    RETURNING *
                `;
                values = [
                    data.slug,
                    data.name,
                    data.description,
                    data.version,
                    capabilitiesJson,
                    configJson,
                    metadataJson
                ];
            } else {
                // Insert new
                query = `
                    INSERT INTO agents (
                        id,
                        slug,
                        name,
                        description,
                        version,
                        capabilities,
                        config,
                        metadata,
                        created_at,
                        updated_at
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                    RETURNING *
                `;
                values = [
                    uuidv4(),
                    data.slug,
                    data.name,
                    data.description,
                    data.version,
                    capabilitiesJson,
                    configJson,
                    metadataJson
                ];
            }

            const result = await db.query<Agent>(query, values);
            return result[0];
        } catch (error) {
            console.error('Error creating/updating agent:', error);
            throw error;
        }
    }

    /**
     * Get agent by slug
     */
    async getAgentBySlug(slug: string): Promise<Agent | null> {
        const query = `
            SELECT * FROM agents
            WHERE slug = $1 AND deleted_at IS NULL
        `;
        const result = await db.query<Agent>(query, [slug]);
        return result[0] || null;
    }

    /**
     * List all enabled agents
     */
    async listAgents(): Promise<Agent[]> {
        const query = `
            SELECT * FROM agents
            WHERE deleted_at IS NULL
            AND (config->>'enabled')::boolean = true
            ORDER BY (config->>'priority')::int DESC
        `;
        return db.query<Agent>(query);
    }
}

export const agentService = new AgentService();
export default agentService;
