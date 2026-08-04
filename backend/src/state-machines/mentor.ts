import { chat, ChatMessage, parseJson } from '../services/llm';
import { retrieveContext, formatContext } from '../services/rag';
import {
  ChoiceOption,
  Concept,
  MentorSessionState,
  MentorState,
  MentorTurn,
  ResponseQuality,
} from '../types';

/**
 * 5-stage Socratic Mentor state machine.
 *
 * Stages: OPEN_QUESTION → NARROWING → FORCED_CHOICE → CONCRETE_ANCHOR →
 * TRANSFER_CHECK → MASTERED.
 *
 * Transitions are deterministic given (currentState, responseQuality):
 *  - OPEN_QUESTION:  good → CONCRETE_ANCHOR | confused → NARROWING | blank → FORCED_CHOICE
 *  - NARROWING:      good → FORCED_CHOICE  | else → FORCED_CHOICE (with hint)
 *  - FORCED_CHOICE:  always → CONCRETE_ANCHOR
 *  - CONCRETE_ANCHOR: always → TRANSFER_CHECK
 *  - TRANSFER_CHECK: good → MASTERED | else → OPEN_QUESTION (re-teach)
 *
 * The LLM classifies response quality and writes the next prompt, grounded in
 * RAG context for the concept being taught.
 */

export function initialMentorState(concept: Concept): MentorSessionState {
  return {
    mode: 'mentor',
    conceptId: concept.id,
    conceptName: concept.name,
    current: 'OPEN_QUESTION',
    turns: [],
  };
}

/** Deterministic transition table. */
export function nextState(
  current: MentorState,
  quality: ResponseQuality
): MentorState {
  switch (current) {
    case 'OPEN_QUESTION':
      if (quality === 'good') return 'CONCRETE_ANCHOR';
      if (quality === 'confused') return 'NARROWING';
      return 'FORCED_CHOICE';
    case 'NARROWING':
      return 'FORCED_CHOICE';
    case 'FORCED_CHOICE':
      return 'CONCRETE_ANCHOR';
    case 'CONCRETE_ANCHOR':
      return 'TRANSFER_CHECK';
    case 'TRANSFER_CHECK':
      return quality === 'good' ? 'MASTERED' : 'OPEN_QUESTION';
    case 'MASTERED':
      return 'MASTERED';
    default:
      return 'OPEN_QUESTION';
  }
}

const STAGE_INSTRUCTIONS: Record<MentorState, string> = {
  OPEN_QUESTION:
    'Ask ONE open, reasoning-oriented question that invites the learner to ' +
    'think aloud about the concept. Do not give the answer. No options.',
  NARROWING:
    'The learner is confused. Ask a NARROWER, more scaffolded question that ' +
    'isolates one sub-idea. Still no answer, no options.',
  FORCED_CHOICE:
    'The learner froze. Provide a supportive one-line hint, then ask a ' +
    'forced-choice question with EXACTLY FOUR options (one correct, three ' +
    'plausible-but-wrong), each with a short rationale.',
  CONCRETE_ANCHOR:
    'Explain the concept using a vivid CONCRETE real-world anchor/metaphor ' +
    '(e.g. lending a notebook, a restaurant menu), then connect it to Rust. ' +
    'End with a short check-in question. No options.',
  TRANSFER_CHECK:
    'Give a NEW scenario the learner has not seen and ask them to apply the ' +
    'concept. Provide a forced-choice question with EXACTLY FOUR options ' +
    '(one correct, three plausible-but-wrong), each with a rationale.',
  MASTERED:
    'Congratulate the learner briefly and summarise the transferable insight. ' +
    'No options.',
};

interface LlmMentorOutput {
  prompt: string;
  options?: { text: string; correct: boolean; rationale: string }[];
}

/**
 * Classify the learner's free-text response quality for the CURRENT stage.
 * Returns 'blank' immediately for empty responses without an LLM call.
 */
export async function classifyResponse(
  conceptName: string,
  stage: MentorState,
  userResponse: string
): Promise<ResponseQuality> {
  const trimmed = (userResponse || '').trim();
  if (trimmed.length === 0) return 'blank';
  if (trimmed.length < 3) return 'blank';

  const chunks = await retrieveContext(`${conceptName} in Rust`, 3);
  const context = formatContext(chunks);

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You classify a Rust learner response into exactly one of: "good" ' +
        '(shows real understanding or a correct choice), "confused" (partial ' +
        'or muddled), or "blank" (no attempt / "I don\'t know"). Use this book ' +
        `context about the concept for grounding:\n\n${context}\n\n` +
        'Respond ONLY with JSON: {"quality": "good"|"confused"|"blank"}.',
    },
    {
      role: 'user',
      content: `Concept: ${conceptName}\nStage: ${stage}\nLearner response: "${trimmed}"`,
    },
  ];

  try {
    const raw = await chat(messages, { json: true, temperature: 0.1, maxTokens: 30 });
    const parsed = parseJson<{ quality: ResponseQuality }>(raw);
    if (['good', 'confused', 'blank'].includes(parsed.quality)) {
      return parsed.quality;
    }
  } catch {
    /* fall through */
  }
  return 'confused';
}

/** Generate the assistant prompt (+ optional options) for a given stage. */
export async function generateTurn(
  conceptName: string,
  stage: MentorState,
  priorResponse?: string
): Promise<MentorTurn> {
  const chunks = await retrieveContext(
    `teaching ${conceptName} in Rust: ${STAGE_INSTRUCTIONS[stage]}`,
    5
  );
  const context = formatContext(chunks);

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        `You are the Rust Mentor teaching the concept "${conceptName}" using ` +
        'the Socratic method. Never lecture; guide with questions and concrete ' +
        'anchors. Ground everything in these book excerpts:\n\n' +
        `${context}\n\n` +
        `STAGE INSTRUCTION: ${STAGE_INSTRUCTIONS[stage]}\n\n` +
        'Respond ONLY with JSON of shape: {"prompt": string, "options"?: ' +
        '[{"text": string, "correct": boolean, "rationale": string}]}.',
    },
    {
      role: 'user',
      content: priorResponse
        ? `The learner just said: "${priorResponse}". Continue teaching.`
        : `Begin teaching "${conceptName}".`,
    },
  ];

  let parsed: LlmMentorOutput;
  try {
    const raw = await chat(messages, { json: true, temperature: 0.5 });
    parsed = parseJson<LlmMentorOutput>(raw);
  } catch {
    parsed = { prompt: `Let's think about ${conceptName}. What do you already know about it?` };
  }

  const needsOptions = stage === 'FORCED_CHOICE' || stage === 'TRANSFER_CHECK';
  let options: ChoiceOption[] | undefined;
  if (needsOptions) {
    const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
    options = (parsed.options || []).slice(0, 4).map((o, i) => ({
      id: letters[i],
      text: o.text,
      correct: Boolean(o.correct),
      rationale: o.rationale,
    }));
    while (options.length < 4) {
      options.push({
        id: letters[options.length],
        text: 'None of the above',
        correct: false,
        rationale: 'Placeholder option.',
      });
    }
    if (!options.some((o) => o.correct)) options[0].correct = true;
  }

  return {
    state: stage,
    prompt: parsed.prompt,
    options,
  };
}

export function isMastered(session: MentorSessionState): boolean {
  return session.current === 'MASTERED';
}
