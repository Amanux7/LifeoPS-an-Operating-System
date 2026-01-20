export type MemoryType = 'short_term' | 'long_term';
export type MemoryCategory = 'interaction' | 'decision' | 'event' | 'pattern' | 'preference';

export interface Memory {
    id: string;
    user_id: string;
    type: MemoryType;
    category: MemoryCategory;
    content: string;
    embedding?: number[];
    metadata: Record<string, any>;
    tags?: string[]; // Note: tags column not in schema.sql but was in my previous code. Schema uses metadata/jsonb?
    // distinct check: schema.sql doesn't have 'tags' column, it has metadata.
    // Wait, looking at schema.sql again...
    // queries in memory.ts were using tags array.
    // schema.sql:
    // 40: CREATE TABLE IF NOT EXISTS memories (
    // ...
    // 53:   metadata JSONB DEFAULT '{}'::jsonb,
    // 
    // It does NOT have detailed tags column.
    // I should probably store tags in metadata or add the column.
    // BUT wait, in step 77 (command_status output for \d memories), it showed:
    // tags | text[] | | |
    // Let me re-verify the database schema from the live database.
    relevance_score: number;
    expires_at?: Date;
    created_at: Date;
    updated_at: Date;
    accessed_at: Date;
    deleted_at?: Date;
}

export interface CreateMemoryDTO {
    userId: string;
    content: string;
    type: MemoryType;
    category: MemoryCategory;
    tags?: string[];
    metadata?: Record<string, any>;
    expiresAt?: Date;
}

export interface SearchMemoryDTO {
    query: string;
    type?: MemoryType;
    category?: MemoryCategory;
    limit?: number;
    threshold?: number;
    tags?: string[];
    userId?: string;
}
