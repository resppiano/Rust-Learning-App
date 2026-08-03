import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes (TODO: import actual route files)
// import sessionsRouter from './routes/sessions';
// import exercisesRouter from './routes/exercises';
// import conceptsRouter from './routes/concepts';
// import progressRouter from './routes/progress';
// import bookIntegrationRouter from './routes/book-integration';

// app.use('/api/sessions', sessionsRouter);
// app.use('/api/exercises', exercisesRouter);
// app.use('/api/concepts', conceptsRouter);
// app.use('/api/progress', progressRouter);
// app.use('/api/book', bookIntegrationRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Rust Learning App API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🦀 Rust Learning App backend listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL || 'not configured'}`);
});

export default app;
