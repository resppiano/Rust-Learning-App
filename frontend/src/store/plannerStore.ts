import { create } from 'zustand';
import { apiClient, Exercise, PlannerStep } from '../api/client';

interface PlannerState {
  sessionId: number | null;
  exercise: Exercise | null;
  currentStep: PlannerStep | null;
  plan: string[];
  totalSteps: number;
  complete: boolean;
  feedback: string;
  discussionPrompts: string[];
  loading: boolean;
  error: string | null;

  start: (exerciseId: number) => Promise<void>;
  respond: (selected: string) => Promise<void>;
  reset: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  sessionId: null,
  exercise: null,
  currentStep: null,
  plan: [],
  totalSteps: 11,
  complete: false,
  feedback: '',
  discussionPrompts: [],
  loading: false,
  error: null,

  start: async (exerciseId: number) => {
    set({ loading: true, error: null, complete: false, plan: [], feedback: '' });
    try {
      const data = await apiClient.startPlanner(exerciseId);
      set({
        sessionId: data.sessionId,
        exercise: data.exercise,
        currentStep: data.currentStep,
        plan: data.plan,
        totalSteps: data.totalSteps,
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  respond: async (selected: string) => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ loading: true, error: null });
    try {
      const data = await apiClient.respondPlanner(sessionId, selected);
      if (data.complete) {
        set({
          complete: true,
          plan: data.plan,
          feedback: data.feedback ?? '',
          discussionPrompts: data.discussionPrompts ?? [],
          currentStep: null,
          loading: false,
        });
      } else {
        set({
          currentStep: data.currentStep,
          plan: data.plan,
          feedback: data.feedback ?? '',
          loading: false,
        });
      }
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  reset: () =>
    set({
      sessionId: null,
      exercise: null,
      currentStep: null,
      plan: [],
      complete: false,
      feedback: '',
      discussionPrompts: [],
      error: null,
    }),
}));
