import { Router, Request, Response } from 'express';
import { pool } from '../db/client';

const router = Router();

/**
 * GET /api/progress?userId=1
 * Returns per-concept progress plus summary counts for the Dashboard.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : 1;

    const progress = await pool.query(
      `SELECT c.id AS concept_id, c.name, c.difficulty_level,
              COALESCE(p.status, 'not_started') AS status,
              COALESCE(p.transfer_check_passed, false) AS transfer_check_passed,
              COALESCE(p.attempts, 0) AS attempts,
              p.last_attempt_at
         FROM concepts c
         LEFT JOIN user_progress p
           ON p.concept_id = c.id AND p.user_id = $1
        ORDER BY c.id`,
      [userId]
    );

    const rows = progress.rows;
    const summary = {
      total: rows.length,
      mastered: rows.filter((r) => r.status === 'mastered').length,
      learning: rows.filter((r) => r.status === 'learning').length,
      notStarted: rows.filter((r) => r.status === 'not_started').length,
    };

    const sessions = await pool.query(
      `SELECT id, mode, status, created_at, completed_at
         FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    return res.json({
      success: true,
      data: { summary, concepts: rows, recentSessions: sessions.rows },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

/**
 * POST /api/progress
 * Body: { userId, conceptId, status?, mastered? } — manual upsert.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, conceptId, status = 'learning', mastered = false } =
      req.body ?? {};
    if (!userId || !conceptId) {
      return res
        .status(400)
        .json({ success: false, error: 'userId and conceptId are required' });
    }
    await pool.query(
      `INSERT INTO user_progress (user_id, concept_id, status, transfer_check_passed, attempts, last_attempt_at)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (user_id, concept_id) DO UPDATE
         SET status = EXCLUDED.status,
             transfer_check_passed = user_progress.transfer_check_passed OR EXCLUDED.transfer_check_passed,
             attempts = user_progress.attempts + 1,
             last_attempt_at = NOW(),
             updated_at = NOW()`,
      [userId, conceptId, status, mastered]
    );
    return res.json({ success: true, data: { userId, conceptId, status } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
