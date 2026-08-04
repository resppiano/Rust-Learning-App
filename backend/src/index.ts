import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { runMigrations } from './db/migrations';
import { healthCheck } from './db/client';
import { isLlmConfigured } from './services/llm';
import { embeddingsAvailable, countChunks } from './services/embeddings';

import sessionsRouter from './routes/sessions';
import exercisesRouter from './routes/exercises';
import conceptsRouter from './routes/concepts';
import progressRouter from './routes/progress';
import executeRouter from './routes/execute';
import bookIntegrationRouter from './routes/book-integration';

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/concepts', conceptsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/execute', executeRouter);
app.use('/api/book', bookIntegrationRouter);

// Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  const db = await healthCheck();
  const ragReady = (await embeddingsAvailable()) && (await countChunks()) > 0;
  res.json({
    success: true,
    data: {
      status: 'ok',
      database: db ? 'connected' : 'unavailable',
      llm: isLlmConfigured() ? 'configured' : 'missing OPENROUTER_API_KEY',
      rag: ragReady ? 'ready' : 'not ingested (run npm run ingest-book)',
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Central error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ success: false, error: err.message });
});

async function start() {
  try {
    await runMigrations();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[startup] Migrations skipped/failed:', msg);
  }

  app.listen(PORT, () => {
    console.log(`🦀 Rust Learning App backend listening on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   CORS origin: ${CORS_ORIGIN}`);
    console.log(`   LLM: ${isLlmConfigured() ? 'OpenRouter configured' : 'NOT configured'}`);
  });
}

start();

export default app;
