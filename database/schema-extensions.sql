-- Rust Learning App — RAG / Book Integration Schema (pgvector)
-- Requires the pgvector extension:  https://github.com/pgvector/pgvector
--
-- If pgvector is NOT installed, the CREATE EXTENSION line below will fail and
-- the backend logs a warning; the core app still runs (RAG simply returns no
-- context and responses fall back to the LLM's own knowledge). To enable RAG,
-- install pgvector and re-run this file, then run `npm run ingest-book`.

CREATE EXTENSION IF NOT EXISTS vector;

-- Text chunks extracted from "The Rust Programming Language" book.
CREATE TABLE IF NOT EXISTS book_chunks (
  id SERIAL PRIMARY KEY,
  chapter VARCHAR(255),
  section VARCHAR(255),
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- One embedding per chunk. Dimension 1536 = openai/text-embedding-3-small.
CREATE TABLE IF NOT EXISTS book_embeddings (
  id SERIAL PRIMARY KEY,
  chunk_id INTEGER REFERENCES book_chunks(id) ON DELETE CASCADE,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_book_chunks_chapter ON book_chunks(chapter);

-- NOTE on vector search performance:
-- For a book-sized corpus (a few thousand chunks) an EXACT scan
-- (ORDER BY embedding <=> query) is fast and gives 100% recall, so no ANN
-- index is created by default. ingest-book.ts only builds an ivfflat index
-- once the corpus grows past ~10k chunks, sizing `lists` ≈ rows/1000. Creating
-- an ivfflat index with too many lists on a small table causes empty lists and
-- silently drops results, so we avoid it here on purpose.
