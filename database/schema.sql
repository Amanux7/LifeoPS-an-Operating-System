-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
  
  -- JSONB for flexible nested data
  preferences JSONB NOT NULL DEFAULT '{
    "defaultAgents": [],
    "priorityWeights": {
      "health": 1.0,
      "financial": 1.0,
      "time": 1.0,
      "relationships": 1.0,
      "career": 1.0,
      "learning": 1.0
    },
    "privacyMode": "standard",
    "notificationSettings": {
      "email": true,
      "push": false,
      "frequency": "daily"
    }
  }'::jsonb,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Classification
  type VARCHAR(20) NOT NULL CHECK (type IN ('short_term', 'long_term')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('interaction', 'decision', 'event', 'pattern', 'preference')),
  
  -- Content
  content TEXT NOT NULL,
  embedding VECTOR(768),  -- Gemini embedding dimensions
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Relevance
  relevance_score FLOAT NOT NULL DEFAULT 1.0,
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  version VARCHAR(20) NOT NULL,
  
  -- Capabilities
  capabilities JSONB NOT NULL,
  
  -- Config
  config JSONB NOT NULL DEFAULT '{
    "timeout": 30000,
    "maxRetries": 3,
    "priority": 1,
    "enabled": true
  }'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Decisions table
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Question
  question TEXT NOT NULL,
  question_embedding VECTOR(768),
  
  -- Context
  context_memory_ids UUID[] DEFAULT ARRAY[]::UUID[],
  context_summary TEXT,
  
  -- Agents
  agents_consulted JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Synthesis
  synthesized_recommendation TEXT NOT NULL,
  synthesis_reasoning TEXT NOT NULL,
  risk_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  alternatives TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- User action
  user_choice TEXT,
  user_chosen_at TIMESTAMPTZ,
  user_feedback TEXT,
  
  -- Outcome
  outcome JSONB DEFAULT '{
    "status": "pending"
 }'::jsonb,
  
  -- Overall confidence
  overall_confidence FLOAT DEFAULT 0.5,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Agent executions table
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  
  -- Execution
  input JSONB NOT NULL,
  output JSONB,
  
  -- Performance
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration INTEGER,  -- milliseconds
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'timeout')),
  error TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(last_active_at) WHERE deleted_at IS NULL;

-- Indexes for memories
CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_expires ON memories(expires_at) WHERE type = 'short_term';

-- Vector similarity search index (using ivfflat)
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100)
  WHERE deleted_at IS NULL;

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_memories_metadata ON memories USING GIN (metadata);

-- Indexes for agents
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_enabled ON agents((config->>'enabled')) WHERE deleted_at IS NULL;

-- Indexes for decisions
CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_decisions_created ON decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_outcome_status ON decisions((outcome->>'status'));
CREATE INDEX IF NOT EXISTS idx_decisions_question_embedding ON decisions USING ivfflat (question_embedding vector_cosine_ops)
  WITH (lists = 100)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_decisions_agents ON decisions USING GIN (agents_consulted);

-- Indexes for agent_executions
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_user ON agent_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_decision ON agent_executions(decision_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created ON agent_executions(created_at DESC);
