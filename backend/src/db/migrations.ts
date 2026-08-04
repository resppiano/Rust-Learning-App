import fs from 'fs';
import path from 'path';
import { pool } from './client';

/**
 * Runs the SQL files in database/ on startup so a fresh clone becomes usable
 * with `npm run dev`. Files are idempotent (CREATE TABLE IF NOT EXISTS / ON
 * CONFLICT DO NOTHING) so running them repeatedly is safe.
 *
 * If pgvector is unavailable the extension statement fails gracefully and the
 * RAG tables are skipped — the rest of the app still works.
 */
const DB_DIR = path.resolve(__dirname, '../../../database');

const FILES = ['schema.sql', 'schema-extensions.sql', 'sample-exercises.sql'];

export async function runMigrations(): Promise<void> {
  for (const file of FILES) {
    const filePath = path.join(DB_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[migrations] Skipping missing file: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf-8');
    try {
      await pool.query(sql);
      console.log(`[migrations] Applied ${file}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // schema-extensions requires pgvector; log but keep going.
      console.warn(`[migrations] Warning while applying ${file}: ${message}`);
    }
  }
}
