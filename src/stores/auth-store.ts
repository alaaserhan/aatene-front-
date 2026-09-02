import { create } from "zustand";
import type { User } from "../auth/types";

/** نفس المسار لكل الطلبات؛ يمنع كوكيز تُرفَق لصفحة فقط وتختفي على مسارات أخرى */
const AUTH_COOKIE_OPTS = {
  expires: 365,
  path: "/" as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

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
