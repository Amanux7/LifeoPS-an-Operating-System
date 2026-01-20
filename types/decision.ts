export interface DecisionOutcome {
    status: 'pending' | 'implemented' | 'rejected' | 'deferred';
    result?: string;
    [key: string]: any;
}

export interface Decision {
    id: string;
    user_id: string;
    question: string;
    question_embedding?: number[];

    // Context
    context_memory_ids: string[];
    context_summary?: string;

    // Process
    agents_consulted: Array<{
        agentId: string;
        agentName: string;
        input: any;
        output: any;
        timestamp: string;
    }>;

    // Result
    synthesized_recommendation: string;
    synthesis_reasoning: string;
    risk_factors: string[];
    alternatives: string[];

    // User Interaction
    user_choice?: string;
    user_chosen_at?: Date;
    user_feedback?: string;

    outcome: DecisionOutcome;
    overall_confidence: number;

    // Metadata
    metadata: Record<string, any>;

    // Timestamps
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface CreateDecisionDTO {
    userId: string;
    question: string;
    metadata?: Record<string, any>;
}

export interface UpdateDecisionSynthesisDTO {
    recommendation: string;
    reasoning: string;
    risks: string[];
    alternatives: string[];
    confidence: number;
}
