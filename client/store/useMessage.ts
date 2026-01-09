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
  hasMore: boolean;
  currentOffset: number;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  updateMessageReactions: (messageId: string, reactions: any[]) => void;
  updateMessageUpvotes: (messageId: string, upvotes: any) => void;
  loadMoreMessages: (messages: Message[], hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  incrementOffset: () => void;
  resetPagination: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  isLoading: false,
  hasMore: true,
  currentOffset: 0,

  setMessages: (messages) => {
    set({ messages, currentOffset: messages.length });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message], // Add to end for chronological order
    }));
  },

  clearMessages: () => {
    set({ messages: [], currentOffset: 0, hasMore: true });
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

  loadMoreMessages: (messages, hasMore) => {
    set((state) => ({
      messages: [...state.messages, ...messages], // Append older messages
      hasMore,
      currentOffset: state.currentOffset + messages.length,
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  incrementOffset: () => {
    set((state) => ({ currentOffset: state.currentOffset + 20 }));
  },

  resetPagination: () => {
    set({ currentOffset: 0, hasMore: true });
  },
}));
