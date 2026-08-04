// Shared TypeScript interfaces for the Rust Learning App backend

/** Standard API response envelope used by every endpoint. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type SessionMode = 'planner' | 'mentor';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

/* ------------------------------------------------------------------ */
/* Planner state machine                                               */
/* ------------------------------------------------------------------ */

export type PlannerState =
  | 'STEP_1_PROBLEM'
  | 'STEP_2_INPUTS'
  | 'STEP_3_OUTPUTS'
  | 'STEP_4_VARIABLES'
  | 'STEP_5_ITERATION'
  | 'STEP_6_CONDITIONS'
  | 'STEP_7_EDGE_CASES'
  | 'STEP_8_ERROR_HANDLING'
  | 'STEP_9_PLAIN_ENGLISH'
  | 'STEP_10_RUST_TRANSLATION'
  | 'STEP_11_VERIFICATION'
  | 'COMPLETE';

export interface ChoiceOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  /** Whether this option is the pedagogically correct choice. */
  correct: boolean;
  /** Short explanation shown after the user chooses. */
  rationale: string;
}

export interface PlannerStep {
  state: PlannerState;
  stepNumber: number;
  question: string;
  options: ChoiceOption[];
  /** The option id the user selected, if any. */
  selected?: string;
}

export interface PlannerSessionState {
  mode: 'planner';
  exerciseId: number;
  current: PlannerState;
  stepIndex: number;
  history: PlannerStep[];
  /** The exact step currently shown to the user (question + options). */
  pending?: PlannerStep;
  /** Accumulated plain-English plan lines. */
  plan: string[];
}

/* ------------------------------------------------------------------ */
/* Mentor state machine                                                */
/* ------------------------------------------------------------------ */

export type MentorState =
  | 'OPEN_QUESTION'
  | 'NARROWING'
  | 'FORCED_CHOICE'
  | 'CONCRETE_ANCHOR'
  | 'TRANSFER_CHECK'
  | 'MASTERED';

export type ResponseQuality = 'good' | 'confused' | 'blank';

export interface MentorTurn {
  state: MentorState;
  /** Assistant question / message shown to the learner. */
  prompt: string;
  /** Forced-choice options (only present in FORCED_CHOICE / TRANSFER_CHECK). */
  options?: ChoiceOption[];
  /** The learner's raw response for this turn. */
  userResponse?: string;
  quality?: ResponseQuality;
}

export interface MentorSessionState {
  mode: 'mentor';
  conceptId: number;
  conceptName: string;
  current: MentorState;
  turns: MentorTurn[];
}

export type SessionState = PlannerSessionState | MentorSessionState;

/* ------------------------------------------------------------------ */
/* Database row shapes                                                 */
/* ------------------------------------------------------------------ */

export interface Concept {
  id: number;
  name: string;
  description: string | null;
  chapter_references: string | null;
  difficulty_level: string | null;
}

export interface Exercise {
  id: number;
  title: string;
  description: string | null;
  problem_statement: string | null;
  expected_output: string | null;
  difficulty_level: string | null;
  concept_id: number | null;
}

export interface SessionRow {
  id: number;
  user_id: number | null;
  exercise_id: number | null;
  mode: SessionMode;
  state: SessionState;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface BookChunk {
  id: number;
  chapter: string | null;
  section: string | null;
  content: string;
  chunk_index: number;
}

export interface RetrievedChunk extends BookChunk {
  similarity: number;
}
