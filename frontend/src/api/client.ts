import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL });

/* ------------------------------------------------------------------ */
/* Shared types (mirror backend/src/types)                             */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChoiceOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  correct: boolean;
  rationale: string;
}

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
  concept_name?: string;
}

export interface PlannerStep {
  state: string;
  stepNumber: number;
  question: string;
  options: ChoiceOption[];
  selected?: string;
}

export interface MentorTurn {
  state: string;
  prompt: string;
  options?: ChoiceOption[];
  userResponse?: string;
  quality?: string;
}

export interface ExecuteResult {
  compiled: boolean;
  stdout: string;
  stderr: string;
  conceptHint: { conceptName: string; code: string; explanation: string } | null;
}

/* ------------------------------------------------------------------ */
/* API calls                                                           */
/* ------------------------------------------------------------------ */

async function unwrap<T>(p: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await p;
  if (!res.data.success || res.data.data === undefined) {
    throw new Error(res.data.error || 'Request failed');
  }
  return res.data.data;
}

export const apiClient = {
  listConcepts: () => unwrap<Concept[]>(api.get('/api/concepts')),
  listExercises: () => unwrap<Exercise[]>(api.get('/api/exercises')),

  startPlanner: (exerciseId: number, userId = 1) =>
    unwrap<{
      sessionId: number;
      mode: 'planner';
      exercise: Exercise;
      totalSteps: number;
      currentStep: PlannerStep;
      plan: string[];
    }>(api.post('/api/sessions', { mode: 'planner', exerciseId, userId })),

  startMentor: (conceptId: number, userId = 1) =>
    unwrap<{
      sessionId: number;
      mode: 'mentor';
      concept: Concept;
      stage: string;
      turn: MentorTurn;
    }>(api.post('/api/sessions', { mode: 'mentor', conceptId, userId })),

  respondPlanner: (sessionId: number, selected: string) =>
    unwrap<any>(api.post(`/api/sessions/${sessionId}/respond`, { selected })),

  respondMentor: (
    sessionId: number,
    payload: { selected?: string; response?: string }
  ) => unwrap<any>(api.post(`/api/sessions/${sessionId}/respond`, payload)),

  execute: (code: string, edition = '2021') =>
    unwrap<ExecuteResult>(api.post('/api/execute', { code, edition })),

  bookSearch: (query: string, topK = 5) =>
    unwrap<{ results: any[] }>(api.post('/api/book/search', { query, topK })),

  getProgress: (userId = 1) =>
    unwrap<{
      summary: { total: number; mastered: number; learning: number; notStarted: number };
      concepts: any[];
      recentSessions: any[];
    }>(api.get(`/api/progress?userId=${userId}`)),

  health: () => unwrap<any>(api.get('/api/health')),
};
