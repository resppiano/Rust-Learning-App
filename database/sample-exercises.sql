-- Rust Learning App — Sample Data
-- 8 exercises + 9 error-to-concept mappings. Idempotent.

-- Error → concept mapping table (mirrors backend/src/services/error-detector.ts)
CREATE TABLE IF NOT EXISTS error_mappings (
  id SERIAL PRIMARY KEY,
  error_code VARCHAR(20) NOT NULL,
  pattern TEXT,
  concept_id INTEGER REFERENCES concepts(id),
  explanation TEXT,
  CONSTRAINT uq_error_code UNIQUE (error_code)
);

INSERT INTO error_mappings (error_code, pattern, concept_id, explanation) VALUES
  ('E0382', 'borrow of moved value', (SELECT id FROM concepts WHERE name='Ownership' LIMIT 1),
   'A value was moved and then used again — ownership / move semantics.'),
  ('E0502', 'cannot borrow as mutable/immutable', (SELECT id FROM concepts WHERE name='Borrowing' LIMIT 1),
   'Conflicting borrows: mutable and immutable borrows active at once.'),
  ('E0499', 'cannot borrow as mutable more than once', (SELECT id FROM concepts WHERE name='Borrowing' LIMIT 1),
   'Two mutable borrows are active simultaneously.'),
  ('E0106', 'missing lifetime specifier', (SELECT id FROM concepts WHERE name='Lifetimes' LIMIT 1),
   'The compiler cannot infer how long a reference should live.'),
  ('E0308', 'mismatched types', (SELECT id FROM concepts WHERE name='Variables & Mutability' LIMIT 1),
   'Expected and found types differ.'),
  ('E0384', 'cannot assign twice to immutable variable', (SELECT id FROM concepts WHERE name='Variables & Mutability' LIMIT 1),
   'Reassigned an immutable binding — needs `mut`.'),
  ('E0277', 'trait not implemented', (SELECT id FROM concepts WHERE name='Traits' LIMIT 1),
   'A required trait bound is not satisfied for this type.'),
  ('E0433', 'failed to resolve / use of undeclared', (SELECT id FROM concepts WHERE name='Collections' LIMIT 1),
   'A path/module could not be resolved — check imports.'),
  ('unwrap', 'called unwrap on None/Err / panicked', (SELECT id FROM concepts WHERE name='Error Handling' LIMIT 1),
   'A panic from unwrap — handle Option/Result properly.')
ON CONFLICT (error_code) DO NOTHING;

-- 8 sample exercises
INSERT INTO exercises (title, description, problem_statement, expected_output, difficulty_level, concept_id) VALUES
  ('Find Largest Number', 'Write a function that finds the largest number in a list',
   'Create a function that takes a vector of integers and returns the largest value.',
   'Some(n) for largest value, None for empty list', 'beginner',
   (SELECT id FROM concepts WHERE name = 'Collections' LIMIT 1)),
  ('Temperature Converter', 'Convert between Celsius and Fahrenheit',
   'Write functions to convert temperatures between Celsius and Fahrenheit.',
   'f32 values correctly converted', 'beginner',
   (SELECT id FROM concepts WHERE name = 'Variables & Mutability' LIMIT 1)),
  ('String Manipulation', 'Process and transform strings',
   'Implement functions to reverse, capitalize, and count words in a string.',
   'Correctly transformed strings', 'beginner',
   (SELECT id FROM concepts WHERE name = 'Collections' LIMIT 1)),
  ('Vector Operations', 'Work with vectors',
   'Implement functions to filter, map, and sum vector elements.',
   'Correctly processed vectors', 'beginner',
   (SELECT id FROM concepts WHERE name = 'Iterators' LIMIT 1)),
  ('Safe Division', 'Handle errors gracefully',
   'Implement division with error handling for division by zero.',
   'Result type with appropriate error messages', 'intermediate',
   (SELECT id FROM concepts WHERE name = 'Error Handling' LIMIT 1)),
  ('Ownership Transfer', 'Understand move semantics',
   'Implement functions that take ownership and explain the flow.',
   'Code that demonstrates ownership transfer', 'intermediate',
   (SELECT id FROM concepts WHERE name = 'Ownership' LIMIT 1)),
  ('Borrow, Do Not Take', 'Use references instead of ownership',
   'Refactor ownership code to use borrowing instead.',
   'Code using &T and &mut T correctly', 'intermediate',
   (SELECT id FROM concepts WHERE name = 'Borrowing' LIMIT 1)),
  ('Guessing Game', 'Build the classic Rust example',
   'Implement a number guessing game with user input and feedback.',
   'Playable game with correct feedback', 'beginner',
   (SELECT id FROM concepts WHERE name = 'Enums & Pattern Matching' LIMIT 1))
ON CONFLICT (title) DO NOTHING;
