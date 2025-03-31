import { create } from 'zustand';

export interface Message {
  id: string;
  message: string;
  timestamp: string;
  username: string;
}

interface MessageStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: string) => Promise<void>;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: async (message: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        message,
        timestamp: new Date().toLocaleString(),
        username: "John Doe" // In real app, get from auth context
      };

      set((state) => ({
        messages: [newMessage, ...state.messages], // Add new message at the beginning
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isLoading: false });
    }
  }
})); 