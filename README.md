# 🦀 Rust Learning App

**An adaptive learning platform that teaches Rust through Socratic pedagogy and problem decomposition.**

---

## 📖 Quick Links

- **[Quick Start](#-quick-start)** ← Set up backend, frontend, database, and RAG
- **[User Guide](USER_GUIDE.md)** - Learn how to use the app
- **[Getting Started](GETTING_STARTED.md)** - Setup instructions
- **[GitHub Setup](GITHUB_SETUP.md)** - Repo / contribution setup
- **[Architecture](#-hybrid-rag--llm-architecture)** - How the hybrid RAG + LLM system works
- **[API Reference](#-api-reference)** - Endpoint list

---

## 🎯 What Makes This Different

Most coding tutorials teach syntax. **This teaches thinking.**

- **Planner Mode**: Learn to decompose any problem into inputs, variables, loops, and failures BEFORE touching code
- **Mentor Mode**: Understand Rust concepts through concrete anchors (not abstract definitions) and Socratic dialogue
- **Adaptive Scaffolding**: Open questions when you can reason, forced-choice when you freeze
- **Research-Backed**: Plausible-but-wrong options teach the reasoning space, not just the right answer

### The Two Skills

| rust-planner | rust-mentor |
|--------------|-------------|
| **When**: Starting a new exercise | **When**: Confused by a concept |
| **How**: 11-step forced-choice sequence | **How**: Socratic questions + concrete anchors |
| **Goal**: Plain-English plan → Rust code | **Goal**: Transferable conceptual understanding |
| **Output**: "Here's what you need" | **Output**: "Now you can reason about new cases" |

---

## 📁 Project Structure

```
rust-learning-app/
├── backend/                 # Node.js + TypeScript API (port 3001)
│   ├── src/
│   │   ├── index.ts        # Express server entry + route mounting
│   │   ├── db/
│   │   │   ├── client.ts   # pg Pool + pgvector registration
│   │   │   └── migrations.ts # Idempotent seed on boot
│   │   ├── routes/         # API endpoints
│   │   │   ├── sessions.ts # Core planner/mentor interactions
│   │   │   ├── exercises.ts
│   │   │   ├── concepts.ts
│   │   │   ├── progress.ts
│   │   │   ├── execute.ts  # Rust Playground proxy
│   │   │   └── book-integration.ts # RAG semantic search
│   │   ├── state-machines/ # Deterministic flow control
│   │   │   ├── planner.ts  # 11-step decomposition engine
│   │   │   └── mentor.ts   # 5-stage Socratic ladder
│   │   ├── services/       # Business logic
│   │   │   ├── llm.ts      # OpenRouter chat completions
│   │   │   ├── embeddings.ts # OpenRouter embeddings
│   │   │   ├── rag.ts      # Chunking + vector retrieval
│   │   │   ├── error-detector.ts
│   │   │   └── discussion-prompts.ts
│   │   └── types/          # TypeScript interfaces
│   ├── scripts/
│   │   └── ingest-book.ts  # One-time PDF → embeddings ingestion
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React + TypeScript SPA (port 3000)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/            # API client
│   │   ├── store/          # Zustand stores (planner, mentor)
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── PlannerSession.tsx
│   │   │   ├── MentorSession.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── components/     # CodeEditor, MentorChat, ChoiceCard, ...
│   │   └── styles/
│   ├── .env.example
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── database/                # PostgreSQL schemas
│   ├── schema.sql
│   ├── schema-extensions.sql
│   └── sample-exercises.sql
│
├── docs/                    # Documentation
│   ├── technical-spec.md
│   ├── ui-mockups-and-flows.md
│   ├── curriculum-alignment.md
│   ├── book-integration-guide.md
│   └── llm-prompts.md
│
├── USER_GUIDE.md            # User-facing guide
├── GETTING_STARTED.md       # Setup instructions
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **PostgreSQL 14+** with the [**pgvector**](https://github.com/pgvector/pgvector) extension (used for book semantic search)
- An **[OpenRouter](https://openrouter.ai/) API key** (single key powers both chat + embeddings)

### 1. Database Setup

Create the database, enable pgvector, and load the schema + seed data:

```bash
# Create a role + database (adjust names to taste)
psql postgres -c "CREATE USER rust_learner WITH PASSWORD 'dev_password';"
psql postgres -c "CREATE DATABASE rust_learning OWNER rust_learner;"

# Enable pgvector (requires the pgvector extension installed on the server)
psql rust_learning -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Load schema + book-integration tables + seed data
psql rust_learning < database/schema.sql
psql rust_learning < database/schema-extensions.sql
psql rust_learning < database/sample-exercises.sql
```

> The schema is **idempotent** — safe to re-run. It seeds 15 concepts, 8 exercises, 9 error mappings, and a demo user (`id = 1`) so the app works without authentication.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env      # then edit .env with your values
npm install
npm run dev               # http://localhost:3001
```

Required `.env` values (see `backend/.env.example`):

```bash
DATABASE_URL=postgresql://rust_learner:dev_password@localhost:5432/rust_learning
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
CHAT_MODEL=openai/gpt-4o
EMBEDDING_MODEL=openai/text-embedding-3-small
PORT=3001
```

### 3. (Optional) Ingest the book for RAG

To power book-grounded semantic search, ingest a PDF of *The Rust Programming Language* **once**:

```bash
cd backend
npm run ingest-book -- /path/to/The\ Rust\ Programming\ Language.pdf
```

This chunks the PDF, generates embeddings via OpenRouter, and stores them in the `book_embeddings` (pgvector) table. It is a **one-time script**, not run automatically at server start. The app runs fine without it — book search simply returns no results until ingestion is done.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

The Vite dev server proxies `/api` → `http://localhost:3001`, so start the backend first.

---

## 🎓 How It Works

### Planner Mode
- 11-step decomposition process
- Forced-choice scaffolding (adapts based on your answers)
- Plain-English algorithm plan before coding
- Maps directly to Rust syntax

### Mentor Mode
- 5-stage Socratic teaching (Open → Narrow → Forced-choice → Concrete → Transfer)
- Escalation ladder: Opens up when you understand, narrows when stuck
- Integrates with The Rust Programming Language book
- Transfer checks verify true understanding

---

## 📊 Key Features

### For Learners
- ✅ Adaptive teaching (scaffolding adjusts to your responses)
- ✅ Error detection (compile errors → concept teaching)
- ✅ Read-along sync (book chapters integrated)
- ✅ Progress tracking (concepts mastered vs learning)
- ✅ Discussion prompts (reflection questions)

### For Educators
- ✅ Customizable concepts and exercises
- ✅ Pre-loaded with 15 core Rust concepts
- ✅ 8 sample exercises (extendable)
- ✅ LLM-powered adaptive responses
- ✅ Analytics-ready (session tracking, error patterns)

---

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express + TypeScript (port 3001)
- PostgreSQL 14+ with JSONB + **pgvector** for embeddings
- **Hybrid RAG + LLM** via [OpenRouter](https://openrouter.ai/) — chat (`openai/gpt-4o`) and embeddings (`openai/text-embedding-3-small`) through one API
- Deterministic state machines drive the Planner (11 steps) and Mentor (5 stages) — the LLM fills content, the state machine controls flow
- Sandboxed code execution proxied to the [Rust Playground](https://play.rust-lang.org/)

**Frontend:**
- React 18 + TypeScript
- Vite (fast dev server & builds, `/api` proxy)
- **CodeMirror 6** editor with Rust syntax highlighting
- Zustand (state management)
- Responsive dark theme (GitHub-inspired: `#0d1117` bg, `#c9d1d9` text, `#58a6ff` accent)

**Database:**
- Core learning tables + book-integration tables (`book_chunks`, `book_embeddings vector(1536)`)
- Pre-loaded: 15 concepts, 8 exercises, 9 error mappings, 1 demo user

---

## 🧩 Hybrid RAG + LLM Architecture

The app never lets the LLM free-run the pedagogy. **Deterministic state machines own the flow; the LLM only fills in content at each controlled step:**

1. A request advances the Planner (11 steps) or Mentor (5 stages) state machine.
2. The machine decides the next step/stage and what kind of content is needed.
3. For book-grounded answers, **RAG** embeds the query, runs a pgvector similarity search over ingested book chunks, and injects the top matches as context.
4. The **LLM** (OpenRouter) generates the step content (question, options, explanation) constrained by that context.
5. The state, choices, and progress are persisted to Postgres.

This keeps interactions reproducible and on-rails while still benefiting from LLM fluency and book grounding.

### Mentor escalation ladder

```
OPEN_QUESTION → NARROWING → FORCED_CHOICE → CONCRETE_ANCHOR → TRANSFER_CHECK → MASTERED
```

The ladder narrows scaffolding when the learner is stuck and opens back up as understanding is demonstrated.

---

## 🔌 API Reference

All responses use a consistent envelope: `{ success: boolean, data?: T, error?: string }`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | DB / LLM / RAG readiness check |
| `GET`  | `/api/concepts` | List all Rust concepts |
| `GET`  | `/api/exercises` | List all exercises |
| `POST` | `/api/sessions` | Start a session — body `{ mode: 'planner' \| 'mentor', exerciseId?, conceptId? }` |
| `GET`  | `/api/sessions/:id` | Fetch current session state |
| `POST` | `/api/sessions/:id/respond` | Submit a response, advance the state machine |
| `GET`  | `/api/progress?userId=1` | Concept mastery summary for a user |
| `POST` | `/api/progress` | Record a learning event / progress update |
| `POST` | `/api/execute` | Compile + run Rust via the Playground proxy |
| `POST` | `/api/book/search` | Semantic (RAG) search over ingested book chunks |
| `GET`  | `/api/book/status` | Book ingestion status (chunk count) |

---

## 📚 Learning Path

The app is organized around *The Rust Programming Language* book chapters:

1. **Chapters 1-3**: Basics (variables, functions, control flow)
2. **Chapters 2, 4**: Core concepts (ownership, moving)
3. **Chapters 5-6**: Data structures (structs, enums)
4. **Chapter 8**: Collections (Vec, String, HashMap)
5. **Chapter 9**: Error handling (Result, Option)
6. **Chapters 10+**: Advanced (traits, lifetimes, closures)

---

## 🧠 Pedagogical Approach

This app is built on research about how people actually learn to code:

### Socratic Method
- Asks questions, not provides answers
- Makes learners think through problems
- Escalates scaffolding when stuck

### Forced-Choice Scaffolding
- Multiple-choice with plausible-but-wrong options
- Teaches the reasoning space, not just the right answer
- Reduces cognitive load for beginners

### Concrete Anchors
- Uses metaphors (lending notebooks, restaurant menus) before abstraction
- Transfers understanding to code
- Brain recognizes patterns from real-world experiences

### Transfer Checks
- Tests if you can apply concepts to NEW situations
- Verifies true understanding vs memorization
- Identifies misconceptions

### Error as Opportunity
- Compile errors trigger concept teaching
- Not just "here's how to fix it"
- "Why did this error happen? What concept is it testing?"

---

## 📈 Success Metrics

**MVP (Complete):**
- ✅ 32 core files, ~12,500 lines
- ✅ 20+ API endpoints
- ✅ 13 database tables
- ✅ 15 documented concepts
- ✅ Full documentation

**Post-Launch Goals:**
- 1,000+ active users
- 70%+ session completion rate
- 75%+ transfer check pass rate
- 40% faster error resolution with Mentor
- 50+ community exercises

---

## 📖 Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use the app
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step setup
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - Repo / contribution setup
- **[Hybrid RAG + LLM Architecture](#-hybrid-rag--llm-architecture)** - How the system is wired
- **[API Reference](#-api-reference)** - Endpoint list

---

## 🤝 Contributing

This project was built to share learning pedagogy for Rust. Contributions welcome!

### Areas for Contribution
- More exercises (currently 8, target 50+)
- Alternative metaphors/concrete anchors
- Additional error mappings
- Community discussion prompts
- Translations

---

## 📝 License

MIT License - See LICENSE file

---

## 🙋 Questions?

- **How do I use this?** → Read [USER_GUIDE.md](USER_GUIDE.md)
- **How do I set it up?** → Read the [Quick Start](#-quick-start) or [GETTING_STARTED.md](GETTING_STARTED.md)
- **How does it work?** → Read the [Hybrid RAG + LLM Architecture](#-hybrid-rag--llm-architecture) section
- **How is the book integrated?** → Ingest a PDF with `npm run ingest-book` and query `/api/book/search`

---

**Made with 🦀 for Rust learners everywhere.**

*Last updated: 2026-08-03*
