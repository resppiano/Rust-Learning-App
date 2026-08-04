import { create } from 'zustand';
import { apiClient, Concept, MentorTurn } from '../api/client';

export interface ChatEntry {
  role: 'assistant' | 'user';
  text: string;
  options?: MentorTurn['options'];
}

interface MentorState {
  sessionId: number | null;
  concept: Concept | null;
  stage: string;
  chat: ChatEntry[];
  currentTurn: MentorTurn | null;
  mastered: boolean;
  discussionPrompts: string[];
  loading: boolean;
  error: string | null;

  start: (conceptId: number) => Promise<void>;
  respond: (payload: { selected?: string; response?: string }) => Promise<void>;
  reset: () => void;
}

export const useMentorStore = create<MentorState>((set, get) => ({
  sessionId: null,
  concept: null,
  stage: 'OPEN_QUESTION',
  chat: [],
  currentTurn: null,
  mastered: false,
  discussionPrompts: [],
  loading: false,
  error: null,

  start: async (conceptId: number) => {
    set({ loading: true, error: null, chat: [], mastered: false });
    try {
      const data = await apiClient.startMentor(conceptId);
      set({
        sessionId: data.sessionId,
        concept: data.concept,
        stage: data.stage,
        currentTurn: data.turn,
        chat: [
          { role: 'assistant', text: data.turn.prompt, options: data.turn.options },
        ],
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  respond: async (payload) => {
    const { sessionId, currentTurn, chat } = get();
    if (!sessionId) return;

    const userText =
      payload.response ??
      currentTurn?.options?.find((o) => o.id === payload.selected)?.text ??
      payload.selected ??
      '';

    set({
      loading: true,
      error: null,
      chat: [...chat, { role: 'user', text: userText }],
    });

    try {
      const data = await apiClient.respondMentor(sessionId, payload);
      const turn: MentorTurn = data.turn;
      set((s) => ({
        stage: data.stage,
        mastered: Boolean(data.mastered),
        currentTurn: turn,
        discussionPrompts: data.discussionPrompts ?? s.discussionPrompts,
        chat: [
          ...s.chat,
          { role: 'assistant', text: turn.prompt, options: turn.options },
        ],
        loading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  reset: () =>
    set({
      sessionId: null,
      concept: null,
      stage: 'OPEN_QUESTION',
      chat: [],
      currentTurn: null,
      mastered: false,
      discussionPrompts: [],
      error: null,
    }),
}));
