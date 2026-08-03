-- Rust Learning App Database Schema
-- PostgreSQL 14+

-- Create database (run separately if needed)
-- CREATE DATABASE rust_learning;

-- Enable JSONB support (built-in with PostgreSQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concepts table (15 core Rust concepts)
CREATE TABLE IF NOT EXISTS concepts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  chapter_references VARCHAR(255),
  difficulty_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem_statement TEXT,
  expected_output TEXT,
  difficulty_level VARCHAR(50),
  concept_id INTEGER REFERENCES concepts(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (learning sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  exercise_id INTEGER REFERENCES exercises(id),
  mode VARCHAR(50), -- 'planner' or 'mentor'
  state JSONB, -- Stores complete session state
  status VARCHAR(50), -- 'in_progress', 'completed', 'abandoned'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  concept_id INTEGER REFERENCES concepts(id),
  status VARCHAR(50), -- 'not_started', 'learning', 'mastered'
  transfer_check_passed BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_exercise ON sessions(exercise_id);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_concept ON user_progress(concept_id);

-- Insert sample concepts
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
  ('Unsafe Rust', 'When safety guarantees don\'t apply', 'Ch. 19.1', 'expert')
ON CONFLICT DO NOTHING;

-- Insert sample exercises
INSERT INTO exercises (title, description, problem_statement, expected_output, difficulty_level, concept_id) VALUES
  ('Find Largest Number', 'Write a function that finds the largest number in a list', 
   'Create a function that takes a vector of integers and returns the largest value', 
   'Some(n) for largest value, None for empty list', 'beginner', 
   (SELECT id FROM concepts WHERE name = 'Variables & Mutability' LIMIT 1)),
  ('Temperature Converter', 'Convert between Celsius and Fahrenheit', 
   'Write functions to convert temperatures between Celsius and Fahrenheit', 
   'f32 values correctly converted', 'beginner', 
   (SELECT id FROM concepts WHERE name = 'Variables & Mutability' LIMIT 1)),
  ('String Manipulation', 'Process and transform strings', 
   'Implement functions to reverse, capitalize, and count words in a string', 
   'Correctly transformed strings', 'beginner', 
   (SELECT id FROM concepts WHERE name = 'Collections' LIMIT 1)),
  ('Vector Operations', 'Work with vectors', 
   'Implement functions to filter, map, and sum vector elements', 
   'Correctly processed vectors', 'beginner', 
   (SELECT id FROM concepts WHERE name = 'Collections' LIMIT 1)),
  ('Error Handling', 'Handle errors gracefully', 
   'Implement division with error handling for division by zero', 
   'Result type with appropriate error messages', 'intermediate', 
   (SELECT id FROM concepts WHERE name = 'Error Handling' LIMIT 1)),
  ('Ownership Transfer', 'Understand move semantics', 
   'Implement functions that take ownership and explain the flow', 
   'Code that demonstrates ownership transfer', 'intermediate', 
   (SELECT id FROM concepts WHERE name = 'Ownership' LIMIT 1)),
  ('Borrowing', 'Use references instead of ownership', 
   'Refactor ownership code to use borrowing instead', 
   'Code using &T and &mut T correctly', 'intermediate', 
   (SELECT id FROM concepts WHERE name = 'Borrowing' LIMIT 1)),
  ('Guessing Game', 'Build the classic Rust example', 
   'Implement a number guessing game with user input and feedback', 
   'Playable game with correct feedback', 'beginner', 
   (SELECT id FROM concepts WHERE name = 'Variables & Mutability' LIMIT 1))
ON CONFLICT DO NOTHING;
