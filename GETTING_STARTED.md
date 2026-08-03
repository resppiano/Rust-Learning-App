# Getting Started with Rust Learning App

Welcome! This guide will help you set up and run the Rust Learning App locally.

---

## 📋 Prerequisites

Before you start, make sure you have installed:

- **Node.js 18+** - Download from https://nodejs.org/
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL 14+** - Download from https://www.postgresql.org/
- **Git** - Download from https://git-scm.com/

### Verify Installation

```bash
node --version      # Should be v18 or higher
npm --version       # Should be 8+
psql --version      # Should be 14+
git --version       # Should be 2.30+
```

---

## 🗄️ Database Setup

### 1. Create Database and User (macOS/Linux)

```bash
# Start PostgreSQL
brew services start postgresql  # macOS with Homebrew
# OR manually start PostgreSQL service

# Connect to PostgreSQL
psql postgres

# Create database and user (in PostgreSQL CLI)
CREATE DATABASE rust_learning;
CREATE USER rust_learner WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE rust_learning TO rust_learner;
\q
```

### 2. Load Schema

```bash
# Navigate to project root
cd rust-learning-app

# Load the schema
psql rust_learning < database/schema.sql

# Load extensions (for book integration)
psql rust_learning < database/schema-extensions.sql

# Load sample data
psql rust_learning < database/sample-exercises.sql

# Verify tables were created
psql rust_learning -c "\dt"
```

You should see tables like: `users`, `concepts`, `exercises`, `sessions`, `user_progress`, etc.

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://rust_learner:dev_password@localhost:5432/rust_learning

# LLM (optional - for Mentor Mode)
OPENAI_API_KEY=your_api_key_here
ANTHROPIC_API_KEY=your_api_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Security Note**: Never commit `.env` files to Git! Use environment variables in production.

### 3. Run Backend

```bash
npm run dev
```

You should see:
```
🦀 Rust Learning App backend listening on port 3001
Environment: development
Database: postgresql://...
```

The backend is now running at `http://localhost:3001`

---

## ⚛️ Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)

Create a `.env` file in `frontend/` if you need custom API URLs:

```bash
# frontend/.env
VITE_API_URL=http://localhost:3001
```

### 3. Run Frontend

```bash
npm run dev
```

You should see:
```
VITE v4.4.5  ready in 123 ms

➜  Local:   http://localhost:3000/
```

Open http://localhost:3000 in your browser!

---

## ✅ Verify Everything Works

### 1. Check Backend Health

```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","message":"Rust Learning App API is running"}
```

### 2. Check Frontend Loads

Visit http://localhost:3000 in your browser. You should see:
- 🦀 Rust Learning App header
- Two buttons: "Planner Mode" and "Mentor Mode"
- Navigation links

### 3. Check Database Connection

```bash
psql rust_learning -c "SELECT COUNT(*) as concept_count FROM concepts;"
# Should return 15 concepts
```

---

## 🚀 Development Workflow

### Terminal Setup (Recommended)

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd rust-learning-app/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd rust-learning-app/frontend
npm run dev
```

**Terminal 3 - General:**
```bash
# For running migrations, inspecting database, etc.
cd rust-learning-app
```

### Making Changes

- **Backend changes** - Automatically reloaded with `ts-node-dev`
- **Frontend changes** - Automatically reloaded with Vite HMR
- **Database schema** - Edit `.sql` files and run them with `psql`

---

## 🗂️ Project Structure

```
rust-learning-app/
├── backend/              # Express API
│   ├── src/
│   │   ├── index.ts     # Main server
│   │   ├── routes/      # API endpoints
│   │   ├── state-machines/  # Planner & Mentor logic
│   │   └── services/    # Business logic
│   ├── package.json
│   └── .env (create this)
│
├── frontend/             # React SPA
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/       # Main screens
│   │   └── components/  # UI components
│   ├── package.json
│   └── .env (optional)
│
├── database/             # PostgreSQL schemas
│   ├── schema.sql
│   ├── schema-extensions.sql
│   └── sample-exercises.sql
│
├── docs/                 # Documentation
│   ├── technical-spec.md
│   ├── curriculum-alignment.md
│   └── ...
│
└── USER_GUIDE.md         # User documentation
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `Cannot find module 'express'`
- Solution: Run `cd backend && npm install`

**Error**: `Port 3001 already in use`
- Solution: `PORT=3002 npm run dev` (use different port)

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`
- Solution: PostgreSQL not running. Start it with `brew services start postgresql`

### Frontend Won't Load

**Error**: `VITE ERR_MODULE_NOT_FOUND`
- Solution: Run `cd frontend && npm install`

**Error**: `Cannot POST /api/sessions` (404)
- Solution: Backend not running. Check Terminal 1.

### Database Issues

**Error**: `database "rust_learning" does not exist`
- Solution: Run `createdb rust_learning` or follow Database Setup above

**Error**: `role "rust_learner" does not exist`
- Solution: Create user with `createuser rust_learner` in `psql`

**Error**: `permission denied for schema public`
- Solution: Run `GRANT ALL ON SCHEMA public TO rust_learner;` in `psql`

---

## 📝 Next Steps

1. **Read the User Guide** - `USER_GUIDE.md` explains how to use the app
2. **Start a Planner Session** - Click "Planner Mode" on the home page
3. **Try Mentor Mode** - Click "Learn a Concept"
4. **Check Your Dashboard** - Track your progress

---

## 🆘 Still Having Issues?

### Check Logs

- **Backend logs** - Look at Terminal 1 for error messages
- **Frontend logs** - Open browser DevTools (F12) → Console tab
- **Database logs** - Check PostgreSQL error logs

### Common Commands

```bash
# List all databases
psql -l

# Connect to database
psql rust_learning

# List all tables
\dt

# Check database size
\db+

# Stop PostgreSQL (macOS)
brew services stop postgresql

# Restart PostgreSQL (macOS)
brew services restart postgresql
```

### Database CLI

```bash
# Inside psql
SELECT COUNT(*) FROM concepts;        -- Check concepts
SELECT COUNT(*) FROM exercises;       -- Check exercises
SELECT COUNT(*) FROM sessions;        -- Check sessions
\q                                     -- Quit
```

---

## 📚 Related Documentation

- **[README.md](README.md)** - Project overview
- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use the app
- **[docs/technical-spec.md](docs/technical-spec.md)** - Technical architecture
- **[docs/book-integration-guide.md](docs/book-integration-guide.md)** - Book features

---

## 🎉 You're Ready!

If you've made it here without errors, you're all set!

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **Database**: rust_learning (PostgreSQL)

Happy learning! 🦀

---

*Last updated: 2026-08-03*
