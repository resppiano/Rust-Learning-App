-- Rust Learning App — Core Schema
-- PostgreSQL 14+
-- Idempotent: safe to run multiple times (used by backend startup migrations).

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concepts (15 core Rust concepts)
CREATE TABLE IF NOT EXISTS concepts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  chapter_references VARCHAR(255),
  difficulty_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  problem_statement TEXT,
  expected_output TEXT,
  difficulty_level VARCHAR(50),
  concept_id INTEGER REFERENCES concepts(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning sessions (planner or mentor). state holds the full state-machine
-- snapshot as JSONB so a session can be resumed.
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  exercise_id INTEGER REFERENCES exercises(id),
  mode VARCHAR(50),                 -- 'planner' | 'mentor'
  state JSONB,                      -- full session state snapshot
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress' | 'completed' | 'abandoned'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Individual steps/turns within a session (optional granular audit trail)
CREATE TABLE IF NOT EXISTS session_steps (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  step_state VARCHAR(100),          -- e.g. 'STEP_3_OUTPUTS' or 'CONCRETE_ANCHOR'
  prompt TEXT,
  user_response TEXT,
  correct BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Per-user, per-concept mastery tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  concept_id INTEGER REFERENCES concepts(id),
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started' | 'learning' | 'mastered'
  transfer_check_passed BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_concept UNIQUE (user_id, concept_id)
);

-- Every interaction event (for analytics / adaptivity)
CREATE TABLE IF NOT EXISTS learning_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exercise ON sessions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_concept ON user_progress(concept_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON learning_events(session_id);
CREATE INDEX IF NOT EXISTS idx_steps_session ON session_steps(session_id);

-- A default demo user (id 1) so the app works without an auth flow.
INSERT INTO users (id, username, email, password_hash)
VALUES (1, 'demo', 'demo@example.com', 'not-a-real-hash')
ON CONFLICT (id) DO NOTHING;

-- Seed the 15 core concepts
INSERT INTO concepts (name, description, chapter_references, difficulty_level) VALUES
  ('Variables & Mutability', 'Understanding mutable and immutable bindings', 'Ch. 3.1', 'beginner'),
  ('Ownership', 'Core concept of Rust memory management', 'Ch. 4.1', 'intermediate'),
  ('Borrowing', 'Lending values to other parts of code', 'Ch. 4.2', 'intermediate'),
  ('Lifetimes', 'Tracking how long references are valid', 'Ch. 10.3', 'advanced'),
  ('Structs', 'Custom data types with named fields', 'Ch. 5', 'beginner'),
  ('Enums & Pattern Matching', 'Representing data with variants', 'Ch. 6', 'intermediate'),
  ('Error Handling', 'Using Result and Option types', 'Ch. 9', 'intermediate'),
  ('Traits', 'Defining shared behavior', 'Ch. 10.2', 'advanced'),
  ('Generics', 'Writing code that works with any type', 'Ch. 10.1', 'intermediate'),
  ('Collections', 'Vectors, Strings, and HashMaps', 'Ch. 8', 'beginner'),
  ('Iterators', 'Processing sequences of elements', 'Ch. 13.2', 'advanced'),
  ('Closures', 'Functions you can store in variables', 'Ch. 13.1', 'intermediate'),
  ('Smart Pointers', 'Box, Rc, RefCell and more', 'Ch. 15', 'advanced'),
  ('Concurrency', 'Writing concurrent programs safely', 'Ch. 16', 'advanced'),
  ('Unsafe Rust', 'When safety guarantees do not apply', 'Ch. 19.1', 'expert')
ON CONFLICT (name) DO NOTHING;
