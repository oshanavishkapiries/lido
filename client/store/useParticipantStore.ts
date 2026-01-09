import { create } from "zustand";

interface Participant {
  name: string;
  joinedAt: string;
  isActive: boolean;
  lastSeen: string;
}

interface ParticipantState {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (name: string) => void;
  clearParticipants: () => void;
}

export const useParticipantStore = create<ParticipantState>((set) => ({
  participants: [],

  setParticipants: (participants) => {
    set({ participants });
  },

  addParticipant: (participant) => {
    set((state) => ({
      participants: [...state.participants, participant],
    }));
  },

  removeParticipant: (name) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.name !== name),
    }));
  },

  clearParticipants: () => {
    set({ participants: [] });
  },
}));
