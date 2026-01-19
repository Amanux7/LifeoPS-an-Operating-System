# LifeOps OS - MVP

AI-powered life operating system for better decision making through multi-agent synthesis.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your OPENAI_API_KEY and DATABASE_URL

# Run database migrations
npm run db:migrate

# Start development
npm run dev
```

### Usage

```bash
# Ask a question
npm run cli ask "Should I negotiate my salary?"

# View decision history
npm run cli history

# Record outcome
npm run cli outcome <decision-id>
```

## Architecture

- **Database**: PostgreSQL with pgvector for semantic search
- **LLM**: OpenAI GPT-4 for synthesis and embeddings
- **Agents**: Specialized domain agents (Career, Financial, Health)
- **Interface**: CLI (Web UI in future phase)

## Project Structure

```
src/
├── cli/              # Command-line interface
├── database/         # Database models and migrations
├── engine/           # Decision synthesis pipeline
├── agents/           # AI agents
├── memory/           # Memory storage and retrieval
└── utils/            # Shared utilities
```

## Development

```bash
# Run in watch mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## License

MIT
