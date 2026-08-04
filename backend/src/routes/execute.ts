import { Router, Request, Response } from 'express';
import { detectConcept } from '../services/error-detector';

const router = Router();

const PLAYGROUND_URL = 'https://play.rust-lang.org/execute';

interface PlaygroundResponse {
  success: boolean;
  stdout: string;
  stderr: string;
}

/**
 * POST /api/execute
 * Body: { code: string, edition?: '2015'|'2018'|'2021' }
 * Proxies to the official Rust Playground and returns stdout/stderr plus a
 * concept hint if the code failed to compile.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code, edition = '2021' } = req.body ?? {};
    if (typeof code !== 'string' || code.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'code (non-empty string) is required' });
    }

    const upstream = await fetch(PLAYGROUND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'stable',
        mode: 'debug',
        edition,
        crateType: 'bin',
        tests: false,
        code,
        backtrace: false,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(502).json({
        success: false,
        error: `Rust Playground error (${upstream.status}): ${text.slice(0, 300)}`,
      });
    }

    const result = (await upstream.json()) as PlaygroundResponse;
    const conceptHint = result.success ? null : detectConcept(result.stderr);

    return res.json({
      success: true,
      data: {
        compiled: result.success,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        conceptHint,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[execute] error:', message);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
