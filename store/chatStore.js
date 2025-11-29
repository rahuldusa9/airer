import { create } from 'zustand';

export default create((set) => ({
  messages: [],
  loading: false,
  streaming: false,
  
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  setStreaming: (streaming) => set({ streaming }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages];
    if (messages.length > 0) {
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content,
      };
    }
    return { messages };
  }),
  
  clearMessages: () => set({ messages: [] }),
}));
