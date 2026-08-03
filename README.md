# 🦀 Rust Learning App

**An adaptive learning platform that teaches Rust through Socratic pedagogy and problem decomposition.**

---

## 📖 Quick Links

- **[User Guide](USER_GUIDE.md)** ← Start here! Learn how to use the app
- **[Getting Started](GETTING_STARTED.md)** - Setup instructions
- **[Technical Spec](docs/technical-spec.md)** - Architecture & implementation details
- **[Book Integration](docs/book-integration-guide.md)** - How the app integrates with The Rust Programming Language book

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
├── backend/                 # Node.js + TypeScript API
│   ├── src/
│   │   ├── index.ts        # Main server entry
│   │   ├── routes/         # API endpoints
│   │   │   ├── sessions.ts # Core learning interactions
│   │   │   ├── exercises.ts
│   │   │   ├── concepts.ts
│   │   │   ├── progress.ts
│   │   │   └── book-integration.ts
│   │   ├── state-machines/ # The magic happens here
│   │   │   ├── planner.ts  # 11-step decomposition engine
│   │   │   └── mentor.ts   # 5-stage Socratic teaching
│   │   ├── services/       # Business logic
│   │   │   ├── error-detector.ts
│   │   │   ├── read-along.ts
│   │   │   └── discussion-prompts.ts
│   │   └── types/          # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React + TypeScript SPA
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── PlannerSession.tsx
│   │   │   ├── MentorSession.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── components/
│   │   ├── styles/
│   │   └── utils/
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
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:3000`

### Database Setup
```bash
psql postgres -c "CREATE DATABASE rust_learning;"
psql rust_learning < database/schema.sql
psql rust_learning < database/schema-extensions.sql
psql rust_learning < database/sample-exercises.sql
```

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
- Node.js + Express + TypeScript
- PostgreSQL 14+ (with JSONB)
- LLM integration (OpenAI GPT-4, Anthropic Claude)

**Frontend:**
- React 18 + TypeScript
- Vite (fast dev server & builds)
- Zustand (state management)
- Responsive dark theme (GitHub-inspired)

**Database:**
- 13 tables (7 core + 6 book integration)
- Pre-loaded: 15 concepts, 8 exercises, 9 error mappings

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

- **USER_GUIDE.md** (839 lines) - How to use the app
- **GETTING_STARTED.md** - Step-by-step setup
- **docs/technical-spec.md** - Full architecture
- **docs/ui-mockups-and-flows.md** - Design specs
- **docs/curriculum-alignment.md** - Book chapter mapping
- **docs/book-integration-guide.md** - Book features
- **docs/llm-prompts.md** - LLM integration guide

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
- **How do I set it up?** → Read [GETTING_STARTED.md](GETTING_STARTED.md)
- **How does it work?** → Read [docs/technical-spec.md](docs/technical-spec.md)
- **How is the book integrated?** → Read [docs/book-integration-guide.md](docs/book-integration-guide.md)

---

**Made with 🦀 for Rust learners everywhere.**

*Last updated: 2026-08-03*
