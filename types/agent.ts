export interface AgentConfig {
    timeout?: number;
    maxRetries?: number;
    priority?: number;
    enabled: boolean;
    [key: string]: any;
}

export interface AgentCapability {
    name: string;
    description: string;
    parameters?: Record<string, any>;
}

export interface Agent {
    id: string;
    name: string;
    slug: string;
    description: string;
    version: string;
    capabilities: AgentCapability[];
    config: AgentConfig;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface CreateAgentDTO {
    name: string;
    slug: string;
    description: string;
    version: string;
    capabilities: AgentCapability[];
    config?: Partial<AgentConfig>;
    metadata?: Record<string, any>;
}

export interface AgentContext {
    userId: string;
    decisionId?: string;
    input: any;
    sessionId?: string;
}

export interface AgentResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: Record<string, any>;
}
