import { pool } from '../db/client';
import { RetrievedChunk } from '../types';

/**
 * pgvector query helpers. Vectors are stored in the `book_embeddings` table and
 * queried with cosine distance (`<=>`). We convert distance to a similarity
 * score (1 - distance) for readability.
 */

/** Format a JS number[] as a pgvector literal: '[0.1,0.2,...]'. */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

/** Whether the pgvector extension + embeddings table are available. */
export async function embeddingsAvailable(): Promise<boolean> {
  try {
    const res = await pool.query(
      `SELECT to_regclass('public.book_embeddings') AS tbl`
    );
    return res.rows[0]?.tbl !== null;
  } catch {
    return false;
  }
}

/** Insert a chunk + its embedding. Returns the new chunk id. */
export async function insertChunkWithEmbedding(chunk: {
  chapter: string | null;
  section: string | null;
  content: string;
  chunkIndex: number;
  embedding: number[];
}): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const chunkRes = await client.query(
      `INSERT INTO book_chunks (chapter, section, content, chunk_index)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [chunk.chapter, chunk.section, chunk.content, chunk.chunkIndex]
    );
    const chunkId = chunkRes.rows[0].id as number;
    await client.query(
      `INSERT INTO book_embeddings (chunk_id, embedding)
       VALUES ($1, $2::vector)`,
      [chunkId, toVectorLiteral(chunk.embedding)]
    );
    await client.query('COMMIT');
    return chunkId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Cosine-similarity top-k search over stored book chunks. */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  topK = 5
): Promise<RetrievedChunk[]> {
  const literal = toVectorLiteral(queryEmbedding);
  const res = await pool.query(
    `SELECT c.id, c.chapter, c.section, c.content, c.chunk_index,
            1 - (e.embedding <=> $1::vector) AS similarity
       FROM book_embeddings e
       JOIN book_chunks c ON c.id = e.chunk_id
      ORDER BY e.embedding <=> $1::vector
      LIMIT $2`,
    [literal, topK]
  );
  return res.rows.map((r) => ({
    id: r.id,
    chapter: r.chapter,
    section: r.section,
    content: r.content,
    chunk_index: r.chunk_index,
    similarity: Number(r.similarity),
  }));
}

/** Count how many chunks have been ingested. */
export async function countChunks(): Promise<number> {
  try {
    const res = await pool.query('SELECT COUNT(*)::int AS n FROM book_chunks');
    return res.rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}
