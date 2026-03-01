// src/stores/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "../features/(web)/auth/types";

interface AuthState {
  isLoggedIn: boolean;
  isHydrated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  hydrate: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      isHydrated: false,
      user: null,

      login: (token, userData) => {
        const isProduction = process.env.NODE_ENV === "production";
        Cookies.set("token", token, {
          expires: 365,
          secure: isProduction,
          sameSite: "lax",
        });
        Cookies.set("user_type", userData.user_type);
        if (userData.user_type === "admin" && userData.permissions) {
          Cookies.set("admin_permissions", JSON.stringify(userData.permissions), { expires: 365 });
        }
        set({ isLoggedIn: true, user: userData });

      },

      logout: () => {
        Cookies.remove("token");
        Cookies.remove("user_type");
        Cookies.remove("current_store_id");
        Cookies.remove("store_type");
        Cookies.remove("store_role");
        Cookies.remove("admin_permissions");
        set({ isLoggedIn: false, user: null });


      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      hydrate: () => {
        if (get().isHydrated) return;

        try {
          const token = Cookies.get("token");
          if (token) {
            set({ isLoggedIn: true });
          } else {
            set({ isLoggedIn: false, user: null });
          }
        } catch (e) {
          console.error(e);
        }
        set({ isHydrated: true });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);