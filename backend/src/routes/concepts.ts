import { Router, Request, Response } from 'express';
import { pool } from '../db/client';

const router = Router();

/** GET /api/concepts — list all Rust concepts. */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM concepts ORDER BY id'
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

/** GET /api/concepts/:id — single concept. */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM concepts WHERE id = $1', [
      Number(req.params.id),
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Concept not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
