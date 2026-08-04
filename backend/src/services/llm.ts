import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OpenRouter client. OpenRouter is OpenAI-API compatible, so we reuse the
 * official `openai` SDK and just point it at the OpenRouter base URL.
 */
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export const CHAT_MODEL = process.env.CHAT_MODEL || 'openai/gpt-4o';
export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small';

if (!OPENROUTER_API_KEY) {
  console.warn(
    '[llm] OPENROUTER_API_KEY is not set. LLM and embedding calls will fail ' +
      'until you add it to backend/.env'
  );
}

const client = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/resppiano/Rust-Learning-App',
    'X-Title': 'Rust Learning App',
  },
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Send a chat completion request. When `json` is true the model is asked to
 * respond with a JSON object (used by the state machines for structured output).
 */
export async function chat(
  messages: ChatMessage[],
  options: { json?: boolean; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { json = false, temperature = 0.4, maxTokens = 900 } = options;

  const completion = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  });

  return completion.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * Parse a JSON object out of an LLM response, tolerating markdown code fences
 * or stray prose that some models add around the JSON.
 */
export function parseJson<T>(raw: string): T {
  let text = raw.trim();
  // Strip ```json ... ``` fences if present.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  // Fall back to slicing between the first { and last }.
  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
  }
  return JSON.parse(text) as T;
}

/** Create an embedding vector for a single piece of text. */
export async function embed(text: string): Promise<number[]> {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding as number[];
}

/** Create embeddings for many texts in one request (used by ingestion). */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding as number[]);
}

export function isLlmConfigured(): boolean {
  return Boolean(OPENROUTER_API_KEY);
}
