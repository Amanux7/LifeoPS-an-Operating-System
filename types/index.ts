export interface User {
    id: string;
    email: string;
    name: string;
    timezone: string;
    preferences: UserPreferences;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    last_active_at: Date;
    deleted_at?: Date;
}

export interface UserPreferences {
    defaultAgents: string[];
    priorityWeights: {
        health: number;
        financial: number;
        time: number;
        relationships: number;
        career: number;
        learning: number;
    };
    privacyMode: 'standard' | 'strict';
    notificationSettings: {
        email: boolean;
        push: boolean;
        frequency: 'realtime' | 'daily' | 'weekly';
    };
}

export interface Memory {
    id: string;
    user_id: string;
    type: 'short_term' | 'long_term';
    category: 'interaction' | 'decision' | 'event' | 'pattern' | 'preference';
    content: string;
    embedding?: number[];
    metadata: Record<string, any>;
    relevance_score: number;
    expires_at?: Date;
    created_at: Date;
    updated_at: Date;
    accessed_at: Date;
    deleted_at?: Date;
}

export interface Agent {
    id: string;
    name: string;
    slug: string;
    description: string;
    version: string;
    capabilities: {
        domains: string[];
        inputSchema: Record<string, any>;
        outputSchema: Record<string, any>;
        supportedOperations: string[];
    };
    config: {
        timeout: number;
        maxRetries: number;
        priority: number;
        enabled: boolean;
    };
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface Decision {
    id: string;
    user_id: string;
    question: string;
    question_embedding?: number[];
    context_memory_ids: string[];
    context_summary?: string;
    agents_consulted: AgentConsultation[];
    synthesized_recommendation: string;
    synthesis_reasoning: string;
    risk_factors: string[];
    alternatives: string[];
    user_choice?: string;
    user_chosen_at?: Date;
    user_feedback?: string;
    outcome: DecisionOutcome;
    overall_confidence: number;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface AgentConsultation {
    agentId: string;
    agentName: string;
    recommendation: string;
    reasoning: string;
    confidence: number;
    weight: number;
    executionTime: number;
}

export interface DecisionOutcome {
    status: 'pending' | 'success' | 'failure' | 'mixed';
    recordedAt?: Date;
    description?: string;
    lessonsLearned?: string[];
    satisfactionScore?: number;
}

export interface AgentExecution {
    id: string;
    agent_id: string;
    user_id: string;
    decision_id?: string;
    input: Record<string, any>;
    output?: Record<string, any>;
    started_at: Date;
    completed_at?: Date;
    duration?: number;
    status: 'success' | 'failure' | 'timeout';
    error?: string;
    metadata: Record<string, any>;
    created_at: Date;
}
