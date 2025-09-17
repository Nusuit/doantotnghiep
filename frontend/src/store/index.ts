import { create } from "zustand";

interface AppState {
  user: null | { id: string; name: string };
  setUser: (user: AppState["user"]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
