import { Router, Request, Response } from 'express';
import { pool } from '../db/client';

const router = Router();

/** GET /api/exercises — list all exercises (optionally filter by concept). */
router.get('/', async (req: Request, res: Response) => {
  try {
    const conceptId = req.query.conceptId ? Number(req.query.conceptId) : null;
    const sql = conceptId
      ? `SELECT e.*, c.name AS concept_name
           FROM exercises e LEFT JOIN concepts c ON c.id = e.concept_id
          WHERE e.concept_id = $1 ORDER BY e.id`
      : `SELECT e.*, c.name AS concept_name
           FROM exercises e LEFT JOIN concepts c ON c.id = e.concept_id
          ORDER BY e.id`;
    const result = conceptId
      ? await pool.query(sql, [conceptId])
      : await pool.query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

/** GET /api/exercises/:id — single exercise. */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM exercises WHERE id = $1', [
      Number(req.params.id),
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Exercise not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
