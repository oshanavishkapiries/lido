import { create } from "zustand";

export interface Message {
  id: string;
  sessionId: string;
  senderName: string;
  content: string;
  type: "message" | "question" | "announcement";
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
  upvotes: {
    count: number;
    users: string[];
  };
  timestamp: string;
}

interface MessageStore {
  messages: Message[];
  isLoading: boolean;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  updateMessageReactions: (messageId: string, reactions: any[]) => void;
  updateMessageUpvotes: (messageId: string, upvotes: any) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  isLoading: false,

  setMessages: (messages) => {
    set({ messages });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [message, ...state.messages], // Add to beginning for reverse chronological
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  updateMessageReactions: (messageId, reactions) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, reactions } : msg
      ),
    }));
  },

  updateMessageUpvotes: (messageId, upvotes) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, upvotes } : msg
      ),
    }));
  },
}));
