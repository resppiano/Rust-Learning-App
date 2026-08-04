import { embed } from './llm';
import {
  searchSimilarChunks,
  embeddingsAvailable,
  countChunks,
} from './embeddings';
import { RetrievedChunk } from '../types';

/**
 * RAG pipeline: chunking + retrieval.
 *
 * Ingestion (embedding + storage) lives in scripts/ingest-book.ts; this module
 * exposes the runtime retrieval side plus the chunking utility they share.
 */

export interface Chunk {
  chapter: string | null;
  section: string | null;
  content: string;
  chunkIndex: number;
}

/** Rough token estimate (~4 chars/token) — good enough for chunk sizing. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split raw book text into ~`targetTokens`-sized chunks with `overlapTokens`
 * of overlap, respecting paragraph boundaries where possible. Chapter/section
 * headings are detected heuristically and attached as metadata.
 */
export function chunkText(
  fullText: string,
  targetTokens = 500,
  overlapTokens = 50
): Chunk[] {
  // Strip NUL bytes and other C0 control chars (except tab/newline) that PDFs
  // often contain — PostgreSQL rejects them in text/jsonb columns.
  const cleaned = fullText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0);

  const chunks: Chunk[] = [];
  let buffer: string[] = [];
  let bufferTokens = 0;
  let currentChapter: string | null = null;
  let currentSection: string | null = null;
  let index = 0;

  const chapterRe = /^(chapter\s+\d+|\d+\.\s+[A-Z])/i;
  const sectionRe = /^(\d+\.\d+\s+|\d+\.\d+\.\d+\s+)/;

  const flush = () => {
    if (buffer.length === 0) return;
    chunks.push({
      chapter: currentChapter,
      section: currentSection,
      content: buffer.join('\n\n'),
      chunkIndex: index++,
    });
    // Keep overlap: retain trailing paragraphs up to overlapTokens.
    const overlap: string[] = [];
    let ot = 0;
    for (let i = buffer.length - 1; i >= 0 && ot < overlapTokens; i--) {
      overlap.unshift(buffer[i]);
      ot += estimateTokens(buffer[i]);
    }
    buffer = overlap;
    bufferTokens = ot;
  };

  for (const para of paragraphs) {
    if (chapterRe.test(para) && para.length < 80) {
      flush();
      currentChapter = para;
      currentSection = null;
      continue;
    }
    if (sectionRe.test(para) && para.length < 120) {
      currentSection = para;
    }

    const pTokens = estimateTokens(para);
    if (bufferTokens + pTokens > targetTokens && buffer.length > 0) {
      flush();
    }
    buffer.push(para);
    bufferTokens += pTokens;
  }
  flush();

  return chunks;
}

/**
 * Retrieve the top-k most relevant book chunks for a query string.
 * Returns [] silently if the RAG store isn't populated so the app degrades
 * gracefully to LLM-only responses.
 */
export async function retrieveContext(
  query: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  if (!(await embeddingsAvailable())) return [];
  if ((await countChunks()) === 0) return [];
  try {
    const queryEmbedding = await embed(query);
    return await searchSimilarChunks(queryEmbedding, topK);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[rag] retrieveContext failed, degrading to LLM-only:', msg);
    return [];
  }
}

/** Format retrieved chunks into a system-prompt-friendly context block. */
export function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'No book excerpts available. Rely on your own Rust knowledge.';
  }
  return chunks
    .map((c, i) => {
      const loc = [c.chapter, c.section].filter(Boolean).join(' / ') || 'The Rust Book';
      return `[Excerpt ${i + 1} — ${loc}]\n${c.content}`;
    })
    .join('\n\n---\n\n');
}
