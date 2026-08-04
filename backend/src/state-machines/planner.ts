import { chat, ChatMessage, parseJson } from '../services/llm';
import { retrieveContext, formatContext } from '../services/rag';
import {
  ChoiceOption,
  Exercise,
  PlannerSessionState,
  PlannerState,
  PlannerStep,
} from '../types';

/**
 * Deterministic 11-step Planner state machine.
 *
 * The *sequence* of states is fixed and enforced in code (deterministic). The
 * LLM only fills in the question text and four forced-choice options for the
 * current step, grounded in RAG context about the exercise. User choices never
 * change WHICH step comes next — they only get recorded into the plan.
 */

export const PLANNER_ORDER: PlannerState[] = [
  'STEP_1_PROBLEM',
  'STEP_2_INPUTS',
  'STEP_3_OUTPUTS',
  'STEP_4_VARIABLES',
  'STEP_5_ITERATION',
  'STEP_6_CONDITIONS',
  'STEP_7_EDGE_CASES',
  'STEP_8_ERROR_HANDLING',
  'STEP_9_PLAIN_ENGLISH',
  'STEP_10_RUST_TRANSLATION',
  'STEP_11_VERIFICATION',
  'COMPLETE',
];

interface StepMeta {
  title: string;
  focus: string;
}

const STEP_META: Record<PlannerState, StepMeta> = {
  STEP_1_PROBLEM: {
    title: 'Understand the Problem',
    focus: 'restating what the program must accomplish in one sentence',
  },
  STEP_2_INPUTS: {
    title: 'Identify Inputs',
    focus: 'what data comes in and its Rust type(s)',
  },
  STEP_3_OUTPUTS: {
    title: 'Identify Outputs',
    focus: 'what the program returns and its Rust type',
  },
  STEP_4_VARIABLES: {
    title: 'Choose Variables',
    focus: 'what state you must track and whether it is mutable',
  },
  STEP_5_ITERATION: {
    title: 'Plan Iteration',
    focus: 'whether/how you loop over the data',
  },
  STEP_6_CONDITIONS: {
    title: 'Plan Conditions',
    focus: 'the decisions/branches the logic must make',
  },
  STEP_7_EDGE_CASES: {
    title: 'Find Edge Cases',
    focus: 'empty input, overflow, and other boundary situations',
  },
  STEP_8_ERROR_HANDLING: {
    title: 'Handle Failure',
    focus: 'how errors are represented (Option/Result/panic)',
  },
  STEP_9_PLAIN_ENGLISH: {
    title: 'Write the Plain-English Plan',
    focus: 'the ordered steps of the algorithm in plain English',
  },
  STEP_10_RUST_TRANSLATION: {
    title: 'Translate to Rust',
    focus: 'which Rust constructs map to each plan step',
  },
  STEP_11_VERIFICATION: {
    title: 'Verify the Plan',
    focus: 'how you would test that the plan is correct',
  },
  COMPLETE: { title: 'Complete', focus: '' },
};

export function stepNumber(state: PlannerState): number {
  return PLANNER_ORDER.indexOf(state) + 1;
}

export function initialPlannerState(exerciseId: number): PlannerSessionState {
  return {
    mode: 'planner',
    exerciseId,
    current: 'STEP_1_PROBLEM',
    stepIndex: 0,
    history: [],
    plan: [],
  };
}

interface LlmStep {
  question: string;
  options: { text: string; correct: boolean; rationale: string }[];
}

/**
 * Ask the LLM to produce the question + four forced-choice options for the
 * current state, grounded in the exercise and RAG context.
 */
export async function generateStep(
  state: PlannerState,
  exercise: Exercise
): Promise<{ question: string; options: ChoiceOption[] }> {
  const meta = STEP_META[state];
  const query = `${exercise.title}: ${meta.focus}. ${exercise.problem_statement ?? ''}`;
  const chunks = await retrieveContext(query, 4);
  const context = formatContext(chunks);

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are the Rust Planner: a deterministic decomposition coach. For the ' +
        'CURRENT step you produce ONE focused question and EXACTLY FOUR ' +
        'forced-choice options. Exactly one option is correct; the other three ' +
        'are plausible-but-wrong to reveal common misconceptions. Each option ' +
        'has a one-sentence rationale explaining why it is right or wrong. ' +
        'Keep language concrete and beginner friendly. Use these book excerpts ' +
        `for grounding:\n\n${context}\n\n` +
        'Respond ONLY with JSON of shape: ' +
        '{"question": string, "options": [{"text": string, "correct": boolean, "rationale": string}] }.',
    },
    {
      role: 'user',
      content:
        `Exercise: "${exercise.title}"\n` +
        `Description: ${exercise.description ?? ''}\n` +
        `Problem: ${exercise.problem_statement ?? ''}\n` +
        `Expected output: ${exercise.expected_output ?? ''}\n\n` +
        `Current planning step: ${meta.title} — focus on ${meta.focus}.`,
    },
  ];

  let parsed: LlmStep;
  try {
    const raw = await chat(messages, { json: true });
    parsed = parseJson<LlmStep>(raw);
  } catch {
    parsed = fallbackStep(meta.title);
  }

  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const options: ChoiceOption[] = (parsed.options || [])
    .slice(0, 4)
    .map((o, i) => ({
      id: letters[i],
      text: o.text,
      correct: Boolean(o.correct),
      rationale: o.rationale,
    }));

  // Guarantee 4 options and at least one correct.
  while (options.length < 4) {
    options.push({
      id: letters[options.length],
      text: 'None of the above',
      correct: false,
      rationale: 'Placeholder option.',
    });
  }
  if (!options.some((o) => o.correct)) options[0].correct = true;

  return { question: parsed.question || `${meta.title}?`, options };
}

function fallbackStep(title: string): LlmStep {
  return {
    question: `${title}: pick the best approach.`,
    options: [
      { text: 'Restate the requirement precisely', correct: true, rationale: 'Clear framing prevents wrong assumptions.' },
      { text: 'Start writing code immediately', correct: false, rationale: 'Skipping planning leads to rework.' },
      { text: 'Copy a similar solution', correct: false, rationale: 'You would not understand the reasoning.' },
      { text: 'Guess and check randomly', correct: false, rationale: 'Unstructured trial wastes time.' },
    ],
  };
}

/**
 * Advance the planner after a user selects an option. Deterministic: always
 * moves to the next state in PLANNER_ORDER regardless of choice correctness.
 */
export function advance(
  session: PlannerSessionState,
  completedStep: PlannerStep
): PlannerSessionState {
  const history = [...session.history, completedStep];

  const chosen = completedStep.options.find(
    (o) => o.id === completedStep.selected
  );
  const meta = STEP_META[completedStep.state];
  const plan = [...session.plan];
  if (chosen) {
    plan.push(`${meta.title}: ${chosen.text}`);
  }

  const nextIndex = session.stepIndex + 1;
  const next = PLANNER_ORDER[Math.min(nextIndex, PLANNER_ORDER.length - 1)];

  return {
    ...session,
    current: next,
    stepIndex: nextIndex,
    history,
    plan,
  };
}

export function isComplete(session: PlannerSessionState): boolean {
  return session.current === 'COMPLETE';
}

export function stepTitle(state: PlannerState): string {
  return STEP_META[state].title;
}
