import { create } from "zustand";
import type { User } from "../auth/types";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  _setSession: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
}

// TODO: remove this and use useAuth and useUser isntead
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoggedIn: false,

  _setSession: (user) => set({ user, isLoggedIn: !!user }),

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...partial } });
  },
}));
