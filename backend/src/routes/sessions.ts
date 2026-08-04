import { Router, Request, Response } from 'express';
import { pool } from '../db/client';
import {
  Concept,
  Exercise,
  MentorSessionState,
  PlannerSessionState,
  PlannerStep,
} from '../types';
import {
  initialPlannerState,
  generateStep,
  advance,
  isComplete,
  stepNumber,
  stepTitle,
} from '../state-machines/planner';
import {
  initialMentorState,
  generateTurn,
  classifyResponse,
  nextState,
  isMastered,
} from '../state-machines/mentor';
import { generateDiscussionPrompts } from '../services/discussion-prompts';

const router = Router();

async function loadExercise(id: number): Promise<Exercise | null> {
  const res = await pool.query('SELECT * FROM exercises WHERE id = $1', [id]);
  return (res.rows[0] as Exercise) || null;
}

async function loadConcept(id: number): Promise<Concept | null> {
  const res = await pool.query('SELECT * FROM concepts WHERE id = $1', [id]);
  return (res.rows[0] as Concept) || null;
}

async function saveSessionState(
  id: number,
  state: PlannerSessionState | MentorSessionState,
  status: string
): Promise<void> {
  await pool.query(
    `UPDATE sessions
        SET state = $1, status = $2::text, updated_at = NOW(),
            completed_at = CASE WHEN $2::text = 'completed' THEN NOW() ELSE completed_at END
      WHERE id = $3`,
    [JSON.stringify(state), status, id]
  );
}

async function logEvent(
  sessionId: number,
  userId: number | null,
  eventType: string,
  payload: unknown
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO learning_events (user_id, session_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
      [userId, sessionId, eventType, JSON.stringify(payload)]
    );
  } catch {
    /* learning_events is best-effort; never block the request */
  }
}

/**
 * POST /api/sessions
 * Body: { mode: 'planner'|'mentor', exerciseId?, conceptId?, userId? }
 * Creates a session and returns the first step / mentor turn.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { mode, exerciseId, conceptId, userId = null } = req.body ?? {};

    if (mode !== 'planner' && mode !== 'mentor') {
      return res
        .status(400)
        .json({ success: false, error: "mode must be 'planner' or 'mentor'" });
    }

    if (mode === 'planner') {
      if (!exerciseId) {
        return res
          .status(400)
          .json({ success: false, error: 'exerciseId is required for planner mode' });
      }
      const exercise = await loadExercise(Number(exerciseId));
      if (!exercise) {
        return res.status(404).json({ success: false, error: 'Exercise not found' });
      }

      let state = initialPlannerState(exercise.id);
      const insert = await pool.query(
        `INSERT INTO sessions (user_id, exercise_id, mode, state, status)
         VALUES ($1, $2, 'planner', $3, 'in_progress') RETURNING id`,
        [userId, exercise.id, JSON.stringify(state)]
      );
      const sessionId = insert.rows[0].id as number;

      const { question, options } = await generateStep(state.current, exercise);
      const step: PlannerStep = {
        state: state.current,
        stepNumber: stepNumber(state.current),
        question,
        options,
      };
      state = { ...state, pending: step };
      await saveSessionState(sessionId, state, 'in_progress');
      await logEvent(sessionId, userId, 'planner_started', { exerciseId: exercise.id });

      return res.json({
        success: true,
        data: {
          sessionId,
          mode: 'planner',
          exercise,
          totalSteps: 11,
          currentStep: step,
          plan: state.plan,
        },
      });
    }

    // mentor
    if (!conceptId) {
      return res
        .status(400)
        .json({ success: false, error: 'conceptId is required for mentor mode' });
    }
    const concept = await loadConcept(Number(conceptId));
    if (!concept) {
      return res.status(404).json({ success: false, error: 'Concept not found' });
    }

    const state = initialMentorState(concept);
    const insert = await pool.query(
      `INSERT INTO sessions (user_id, exercise_id, mode, state, status)
       VALUES ($1, NULL, 'mentor', $2, 'in_progress') RETURNING id`,
      [userId, JSON.stringify(state)]
    );
    const sessionId = insert.rows[0].id as number;

    const turn = await generateTurn(concept.name, state.current);
    state.turns.push(turn);
    await saveSessionState(sessionId, state, 'in_progress');
    await logEvent(sessionId, userId, 'mentor_started', { conceptId: concept.id });

    return res.json({
      success: true,
      data: {
        sessionId,
        mode: 'mentor',
        concept,
        stage: state.current,
        turn,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sessions] create error:', message);
    return res.status(500).json({ success: false, error: message });
  }
});

/** GET /api/sessions/:id — fetch full session state. */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

/**
 * POST /api/sessions/:id/respond
 * Body: { selected?: 'A'|'B'|'C'|'D', response?: string }
 * Advances the state machine and returns the next step/turn.
 */
router.post('/:id/respond', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { selected, response } = req.body ?? {};

    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    const row = result.rows[0];
    const userId = row.user_id as number | null;
    const state = row.state as PlannerSessionState | MentorSessionState;

    if (state.mode === 'planner') {
      return handlePlannerRespond(id, userId, state, selected, res);
    }
    return handleMentorRespond(id, userId, state, selected, response, res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sessions] respond error:', message);
    return res.status(500).json({ success: false, error: message });
  }
});

async function handlePlannerRespond(
  sessionId: number,
  userId: number | null,
  state: PlannerSessionState,
  selected: string | undefined,
  res: Response
) {
  if (isComplete(state)) {
    return res.json({
      success: true,
      data: { sessionId, complete: true, plan: state.plan },
    });
  }
  if (!selected) {
    return res
      .status(400)
      .json({ success: false, error: 'selected (A/B/C/D) is required' });
  }

  const exercise = await loadExercise(state.exerciseId);
  if (!exercise) {
    return res.status(404).json({ success: false, error: 'Exercise not found' });
  }

  // Use the EXACT step (question + options) that was shown to the user, so the
  // recorded choice, rationale and plan line all match what they saw.
  const shown =
    state.pending && state.pending.state === state.current
      ? state.pending
      : {
          state: state.current,
          stepNumber: stepNumber(state.current),
          ...(await generateStep(state.current, exercise)),
        };
  const completedStep: PlannerStep = { ...shown, selected };

  const chosen = completedStep.options.find((o) => o.id === selected);
  const advanced = advance(state, completedStep);

  await logEvent(sessionId, userId, 'planner_step', {
    step: completedStep.state,
    selected,
    correct: chosen?.correct ?? false,
  });

  if (isComplete(advanced)) {
    await saveSessionState(sessionId, advanced, 'completed');
    const prompts = await generateDiscussionPrompts(
      exercise.title,
      3
    ).catch(() => []);
    return res.json({
      success: true,
      data: {
        sessionId,
        complete: true,
        plan: advanced.plan,
        feedback: chosen?.rationale ?? '',
        discussionPrompts: prompts,
      },
    });
  }

  const nextStep = await generateStep(advanced.current, exercise);
  const step: PlannerStep = {
    state: advanced.current,
    stepNumber: stepNumber(advanced.current),
    question: nextStep.question,
    options: nextStep.options,
  };
  advanced.pending = step;
  await saveSessionState(sessionId, advanced, 'in_progress');

  return res.json({
    success: true,
    data: {
      sessionId,
      complete: false,
      feedback: chosen?.rationale ?? '',
      lastChoiceCorrect: chosen?.correct ?? false,
      currentStep: step,
      stepTitle: stepTitle(advanced.current),
      plan: advanced.plan,
      progress: { current: step.stepNumber, total: 11 },
    },
  });
}

async function handleMentorRespond(
  sessionId: number,
  userId: number | null,
  state: MentorSessionState,
  selected: string | undefined,
  response: string | undefined,
  res: Response
) {
  if (isMastered(state)) {
    return res.json({
      success: true,
      data: { sessionId, mastered: true, stage: 'MASTERED' },
    });
  }

  const lastTurn = state.turns[state.turns.length - 1];
  const userText =
    response ??
    (selected && lastTurn?.options
      ? lastTurn.options.find((o) => o.id === selected)?.text ?? ''
      : '');

  // Determine quality. For forced-choice/transfer, correctness of the pick maps
  // directly to good/confused; otherwise classify the free text with the LLM.
  let quality: import('../types').ResponseQuality;
  if (lastTurn?.options && selected) {
    const picked = lastTurn.options.find((o) => o.id === selected);
    quality = picked?.correct ? 'good' : 'confused';
  } else {
    quality = await classifyResponse(state.conceptName, state.current, userText);
  }

  if (lastTurn) {
    lastTurn.userResponse = userText;
    lastTurn.quality = quality;
  }

  const upcoming = nextState(state.current, quality);
  state.current = upcoming;

  await logEvent(sessionId, userId, 'mentor_turn', {
    fromStage: lastTurn?.state,
    quality,
    toStage: upcoming,
  });

  if (upcoming === 'MASTERED') {
    const masterTurn = await generateTurn(state.conceptName, 'MASTERED', userText);
    state.turns.push(masterTurn);
    await saveSessionState(sessionId, state, 'completed');
    await updateConceptProgress(userId, state.conceptId, true);
    const prompts = await generateDiscussionPrompts(state.conceptName, 3).catch(
      () => []
    );
    return res.json({
      success: true,
      data: {
        sessionId,
        mastered: true,
        stage: 'MASTERED',
        turn: masterTurn,
        discussionPrompts: prompts,
      },
    });
  }

  const nextTurn = await generateTurn(state.conceptName, upcoming, userText);
  state.turns.push(nextTurn);
  await saveSessionState(sessionId, state, 'in_progress');
  await updateConceptProgress(userId, state.conceptId, false);

  return res.json({
    success: true,
    data: {
      sessionId,
      mastered: false,
      quality,
      stage: upcoming,
      turn: nextTurn,
    },
  });
}

async function updateConceptProgress(
  userId: number | null,
  conceptId: number,
  mastered: boolean
): Promise<void> {
  if (!userId) return;
  try {
    await pool.query(
      `INSERT INTO user_progress (user_id, concept_id, status, transfer_check_passed, attempts, last_attempt_at)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (user_id, concept_id) DO UPDATE
         SET status = EXCLUDED.status,
             transfer_check_passed = user_progress.transfer_check_passed OR EXCLUDED.transfer_check_passed,
             attempts = user_progress.attempts + 1,
             last_attempt_at = NOW(),
             updated_at = NOW()`,
      [userId, conceptId, mastered ? 'mastered' : 'learning', mastered]
    );
  } catch {
    /* best effort */
  }
}

export default router;
