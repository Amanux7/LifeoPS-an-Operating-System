<div align="center">
  <h1>🚀 LifeOps OS</h1>
  <p><strong>Your AI-Powered Operating System for Life & Decision Making</strong></p>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
  [![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
</div>

---

## 📖 About LifeOps OS

**LifeOps OS** is a cutting-edge, local-first artificial intelligence platform designed to augment your daily life and decision-making processes. By synthesizing insights from specialized domain agents—such as Career, Financial, and Health—LifeOps OS acts as your personal cognitive extension.

Powered by advanced Large Language Models (OpenAI GPT-4 / Google Gemini) and leveraging **Retrieval-Augmented Generation (RAG)** via PostgreSQL with `pgvector`, your OS remembers your past context, aligns with your values, and providing highly tailored, actionable recommendations.

### ✨ Key Features

- **🧠 Multi-Agent Synthesis Pipeline**: Combines insights from specialized AI agents into a single, cohesive recommendation.
- **📚 Semantic Memory (pgvector)**: Remembers your context across sessions. It retrieves relevant past decisions and interactions using high-dimensional vector embeddings.
- **🖥️ Interactive CLI Interface**: A beautifully crafted, terminal-based user interface using `inquirer`, `chalk`, and `gradient-string` for a seamless experience.
- **⚡ LLM Agnostic Core**: Uses advanced LLMs for deep reasoning, synthesis, and text embedding generation.
- **🔒 Local-First Data**: Your memories and decision logs are stored locally in your PostgreSQL database.

---

## 🏗️ Architecture Design

LifeOps OS uses a highly modular and extensible architecture, making it simple to add new agents and new interaction layers.

```mermaid
graph TD;
    User([👤 User]) -->|Interacts via| CLI[🖥️ CLI Interface];
    CLI --> Core[⚙️ Decision Synthesis Engine];
    Core <-->|Context Retrieval| VectorDB[(🐘 PostgreSQL + pgvector)];
    Core -->|Delegates to| Agents[🤖 Specialized Agents];
    Agents --> Career[💼 Career Agent];
    Agents --> Finance[💰 Financial Agent];
    Agents --> Health[🩺 Health Agent];
    Agents --> Core[Synthesizes Results];
    Core --> LLM[🧠 LLM Provider (OpenAI/Gemini)];
    LLM --> Core;
    Core -->|Final Output| User;
```

---

## 📂 Project Structure

```text
src/
├── agents/           # Specialized AI agent implementations
├── cli/              # Command-line interface definitions and rendering
├── database/         # PostgreSQL connection logic and migrations
├── engine/           # Core Decision synthesis and reasoning pipeline
├── services/         # Third-party integrations (Gemini, OpenAI, DB queries)
├── types/            # TypeScript type definitions and interfaces
└── utils/            # Shared utilities and helper functions
```

---

## 🚀 Getting Started

Follow these steps to get your LifeOps OS up and running on your local machine.

### Prerequisites

Ensure you have the following installed before proceeding:
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **pgvector**: PostgreSQL extension for vector operations
- Valid API keys for **OpenAI** or **Google Gemini**

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   # Install NPM packages
   npm install
   ```

2. **Configure your Environment Variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   *Open the `.env` file and add your `OPENAI_API_KEY`, `GEMINI_API_KEY`, and `DATABASE_URL`.*

3. **Initialize the Database:**
   Ensure your PostgreSQL instance is running, then run the migrations.
   ```bash
   # Run database migrations to setup schemas and pgvector
   npm run db:migrate
   
   # Optional: Seed the database with initial agent configs
   npm run db:seed
   ```

---

## 💻 Usage

Start the interactive CLI to begin using LifeOps OS.

```bash
# Start the interactive dashboard
npm run cli
```

### Direct CLI Commands

You can also use the CLI to jump straight into specific actions:

```bash
# Ask a specific question directly
npm run cli ask "Should I negotiate my salary for the new job offer?"

# View your decision and memory history
npm run cli history

# Record the outcome of a past decision
npm run cli outcome <decision-id>
```

---

## 🛠️ Development

If you want to extend or modify LifeOps OS:

```bash
# Run the application in watch mode using tsx
npm run dev

# Build the TypeScript project for production
npm run build

# Run the Jest test suite
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

---
<div align="center">
  <i>Built with ❤️ for better decision making.</i>
</div>
