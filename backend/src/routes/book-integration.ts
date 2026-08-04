import { Router, Request, Response } from 'express';
import { retrieveContext } from '../services/rag';
import { countChunks, embeddingsAvailable } from '../services/embeddings';

const router = Router();

/**
 * POST /api/book/search
 * Body: { query: string, topK?: number }
 * Returns the most relevant book chunks via pgvector similarity search (RAG).
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 } = req.body ?? {};
    if (typeof query !== 'string' || query.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'query (non-empty string) is required' });
    }
    const chunks = await retrieveContext(query, Math.min(Number(topK) || 5, 10));
    return res.json({ success: true, data: { results: chunks } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

/** GET /api/book/status — is the RAG store populated? */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const available = await embeddingsAvailable();
    const chunks = available ? await countChunks() : 0;
    return res.json({
      success: true,
      data: {
        pgvectorAvailable: available,
        chunksIngested: chunks,
        ready: available && chunks > 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
