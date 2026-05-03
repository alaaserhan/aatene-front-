// src/stores/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "../features/(web)/auth/types";

/** نفس المسار لكل الطلبات؛ يمنع كوكيز تُرفَق لصفحة فقط وتختفي على مسارات أخرى */
const AUTH_COOKIE_OPTS = {
  expires: 365,
  path: "/" as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

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
        Cookies.set("token", token, AUTH_COOKIE_OPTS);
        Cookies.set("user_type", userData.user_type, AUTH_COOKIE_OPTS);
        if (userData.user_type === "admin" && userData.permissions) {
          Cookies.set("admin_permissions", JSON.stringify(userData.permissions), AUTH_COOKIE_OPTS);
        }
        set({ isLoggedIn: true, user: userData });

      },

      logout: () => {
        const rm = { path: "/" as const };
        Cookies.remove("token", rm);
        Cookies.remove("user_type", rm);
        Cookies.remove("current_store_id", rm);
        Cookies.remove("store_type", rm);
        Cookies.remove("store_role", rm);
        Cookies.remove("admin_permissions", rm);
        set({ isLoggedIn: false, user: null });


      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          // ProfileResource returns "avatar" with full URL; UserMenu reads "avatar_url".
          // Keep both fields in sync so neither source causes a missing avatar.
          const syncedData = { ...userData };
          if (syncedData.avatar && !syncedData.avatar_url) {
            syncedData.avatar_url = syncedData.avatar as string;
          } else if (syncedData.avatar_url && !syncedData.avatar) {
            syncedData.avatar = syncedData.avatar_url as string;
          }
          if (syncedData.cover && !syncedData.cover_url) {
            syncedData.cover_url = syncedData.cover as string;
          } else if (syncedData.cover_url && !syncedData.cover) {
            syncedData.cover = syncedData.cover_url as string;
          }
          const updated = { ...currentUser, ...syncedData };
          // Sync user_type cookie when it changes
          if (userData.user_type && userData.user_type !== currentUser.user_type) {
            Cookies.set("user_type", userData.user_type, AUTH_COOKIE_OPTS);
          }
          set({ user: updated });
        }
      },

      hydrate: () => {
        if (get().isHydrated) return;

        try {
          const token = Cookies.get("token");
          set({
            isLoggedIn: !!token,
            user: token ? get().user : null,
            isHydrated: true,
          });
        } catch (e) {
          console.error(e);
          set({ isHydrated: true });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isLoggedIn: state.isLoggedIn 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = Cookies.get("token");
          if (!token) {
            state.isLoggedIn = false;
            state.user = null;
          }
          state.isHydrated = true;
        }
      },
    }
  )
);