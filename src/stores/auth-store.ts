// src/stores/auth-store.ts
import { create } from "zustand";
import Cookies from "js-cookie";
import { User } from "../features/(web)/auth/types"; // Import the User type

interface AuthState {
  isLoggedIn: boolean;
  isHydrated: boolean;
  user: User | null; // ⭐️ Add user state
  login: (token: string, userData: User) => void; // ⭐️ Login now takes user data
  logout: () => void;
  hydrate: () => void;
  // Optional: Function to update user data without logging out (e.g., after profile edit)
  // setUser: (userData: User) => void; 
}

export const useAuthStore = create<AuthState>((set, get) => ({ // Add 'get' to read state
  isLoggedIn: false,
  isHydrated: false,
  user: null, // ⭐️ Initialize user as null

  login: (token, userData) => {
    const isProduction = process.env.NODE_ENV === 'production';
    Cookies.set("token", token, { expires: 365, secure: isProduction, sameSite: "lax" });
    Cookies.set("user_type", userData.user_type)
    set({ isLoggedIn: true, user: userData }); // ⭐️ Set user data
  },

  logout: () => {
    Cookies.remove("token");
    set({ isLoggedIn: false, user: null }); // ⭐️ Clear user data
  },

  hydrate: () => {
    // Only run hydrate if it hasn't run before
    if (get().isHydrated) return; 
    
    try {
      const token = Cookies.get("token");
      if (token) {
        // We only know they *might* be logged in. We don't have user data yet.
        // We could fetch user profile here, but it's often better
        // to fetch it when a component actually needs it.
        set({ isLoggedIn: true });
      }
    } catch (e) {
      console.error("Error hydrating auth store:", e);
    }
    set({ isHydrated: true });
  },

  // Example optional function
  // setUser: (userData) => {
  //   set({ user: userData });
  // }
}));