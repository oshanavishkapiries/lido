import { create } from "zustand";

interface Session {
  _id: string;
  sessionName: string;
  sessionId: string;
  isActive: boolean;
  createdAt: string;
  __v: number;
}

interface SessionState {
  sessions: Record<string, Session>;
  getSession: (id: string) => Session | undefined;
  setSession: (session: Session) => void;
  clearSession: (id: string) => void;
}

const useSession = create<SessionState>((set, get) => ({
  sessions: {},

  getSession: (id: string) => {
    return get().sessions[id];
  },

  setSession: (session: Session) => {
    set((state) => ({
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
    }));
  },

  clearSession: (id: string) => {
    set((state) => {
      const { [id]: removed, ...rest } = state.sessions;
      return { sessions: rest };
    });
  },
}));

export default useSession;
