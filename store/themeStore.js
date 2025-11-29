import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define storage first to avoid circular reference during minification
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

// Export immediately to prevent TDZ issues
export default create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(getStorage),
    }
  )
);
