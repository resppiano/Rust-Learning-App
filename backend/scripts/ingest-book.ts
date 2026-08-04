/**
 * One-time ingestion script: chunk "The Rust Programming Language" PDF, embed
 * each chunk via OpenRouter, and store the vectors in pgvector.
 *
 * Usage:
 *   1. Ensure PostgreSQL is running and schema-extensions.sql has been applied
 *      (the backend runs migrations automatically on startup).
 *   2. Place the PDF somewhere and set BOOK_PDF_PATH in backend/.env, or pass a
 *      path as the first CLI argument.
 *   3. From backend/:  npm run ingest-book -- /path/to/book.pdf
 *
 * This script is NOT run automatically by the server — it is a manual setup step.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import pdfParse from 'pdf-parse';

import { pool } from '../src/db/client';
import { embedBatch } from '../src/services/llm';
import { chunkText } from '../src/services/rag';
import { toVectorLiteral } from '../src/services/embeddings';

// Load .env from backend directory explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_PATHS = [
  process.argv[2],
  process.env.BOOK_PDF_PATH,
  path.resolve(__dirname, '../../docs/The Rust Programming Language.pdf'),
  '/home/ubuntu/Uploads/The Rust Programming Language.pdf',
].filter(Boolean) as string[];

const BATCH_SIZE = 64;

async function ensureSchema(): Promise<void> {
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS book_chunks (
      id SERIAL PRIMARY KEY,
      chapter VARCHAR(255),
      section VARCHAR(255),
      content TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS book_embeddings (
      id SERIAL PRIMARY KEY,
      chunk_id INTEGER REFERENCES book_chunks(id) ON DELETE CASCADE,
      embedding vector(1536),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

async function resetTables(): Promise<void> {
  await pool.query('TRUNCATE book_embeddings, book_chunks RESTART IDENTITY CASCADE');
}

async function main() {
  const pdfPath = DEFAULT_PATHS.find((p) => p && fs.existsSync(p));
  if (!pdfPath) {
    console.error(
      'PDF not found. Pass a path as the first argument or set BOOK_PDF_PATH.\n' +
        `Looked in:\n${DEFAULT_PATHS.map((p) => `  - ${p}`).join('\n')}`
    );
    process.exit(1);
  }

  console.log(`📖 Reading PDF: ${pdfPath}`);
  const buffer = fs.readFileSync(pdfPath);
  const parsed = await pdfParse(buffer);
  console.log(`   Extracted ${parsed.text.length.toLocaleString()} characters`);

  console.log('✂️  Chunking (~500 tokens, 50-token overlap)...');
  const chunks = chunkText(parsed.text, 500, 50);
  console.log(`   Produced ${chunks.length} chunks`);

  if (chunks.length === 0) {
    console.error('No chunks produced — aborting.');
    process.exit(1);
  }

  console.log('🗄️  Ensuring pgvector schema...');
  await ensureSchema();

  console.log('🧹 Clearing existing chunks/embeddings...');
  await resetTables();

  console.log('🧠 Embedding + inserting in batches...');
  let inserted = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatch(batch.map((c) => c.content));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let j = 0; j < batch.length; j++) {
        const c = batch[j];
        const chunkRes = await client.query(
          `INSERT INTO book_chunks (chapter, section, content, chunk_index)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [c.chapter, c.section, c.content, c.chunkIndex]
        );
        const chunkId = chunkRes.rows[0].id as number;
        await client.query(
          `INSERT INTO book_embeddings (chunk_id, embedding) VALUES ($1, $2::vector)`,
          [chunkId, toVectorLiteral(embeddings[j])]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    inserted += batch.length;
    console.log(`   ${inserted}/${chunks.length} chunks embedded`);
  }

  // Build an approximate index only when the corpus is large enough for it to
  // help. ivfflat needs `lists` ≈ rows/1000 and enough rows per list, otherwise
  // many lists are empty and recall collapses. For small corpora we rely on an
  // exact scan (fast and 100% recall for a few thousand chunks).
  const IVFFLAT_MIN_ROWS = 10000;
  if (inserted >= IVFFLAT_MIN_ROWS) {
    const lists = Math.max(1, Math.floor(inserted / 1000));
    console.log(`🔧 Creating ivfflat index (lists=${lists})...`);
    try {
      await pool.query(
        `CREATE INDEX IF NOT EXISTS book_embeddings_vec_idx
           ON book_embeddings USING ivfflat (embedding vector_cosine_ops)
           WITH (lists = ${lists})`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`   Index creation skipped: ${msg}`);
    }
  } else {
    console.log(
      `ℹ️  ${inserted} chunks — using exact search (no ivfflat index needed).`
    );
    await pool.query('DROP INDEX IF EXISTS book_embeddings_vec_idx').catch(() => undefined);
  }

  console.log(`✅ Done. ${inserted} chunks ingested into pgvector.`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});
