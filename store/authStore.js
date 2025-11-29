import { create } from 'zustand';

export default create((set) => ({
  user: null,
  session: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  
  logout: () => set({ user: null, session: null }),
}));
