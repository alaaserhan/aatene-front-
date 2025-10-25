import { create } from "zustand";
import Cookies from "js-cookie";

interface AuthState {
  isLoggedIn: boolean; // هل اليوزر مسجل دخوله؟
  isHydrated: boolean; // هل الـ store قرأ الكوكيز خلاص؟
  login: (token: string) => void; // دالة اللوجين
  logout: () => void; // دالة اللوج أوت
  hydrate: () => void; // دالة مزامنة الكوكيز مع الـ state
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false, // القيمة الافتراضية
  isHydrated: false, // القيمة الافتراضية

  /**
   * دالة بنستدعيها لما اليوزر يعمل لوجين
   * @param token التوكن اللي راجع من الـ API
   */
  login: (token) => {
    // 1. خزّن التوكن في الكوكيز (مثلاً لمدة 7 أيام)
    // ⭐️ عدّل اسم الكوكي "token" لو مختلف
    Cookies.set("token", token, { expires: 7, secure: true });
    
    // 2. حدّث الـ state
    set({ isLoggedIn: true });
  },

  /**
   * دالة بنستدعيها لما اليوزر يعمل لوج أوت
   */
  logout: () => {
    // 1. امسح التوكن من الكوكيز
    // ⭐️ عدّل اسم الكوكي "token" لو مختلف
    Cookies.remove("token");
    
    // 2. حدّث الـ state
    set({ isLoggedIn: false });
  },

  /**
   * دالة بتشتغل مرة واحدة بس عشان تقرأ الكوكيز
   * وتعرف الـ store إذا كان اليوزر مسجل أصلاً ولا لأ
   */
  hydrate: () => {
    try {
      // ⭐️ عدّل اسم الكوكي "token" لو مختلف
      const token = Cookies.get("token");
      if (token) {
        set({ isLoggedIn: true });
      }
    } catch (e) {
      console.error("Error hydrating auth store:", e);
    }
    // بلّغ الـ store إن المزامنة تمت
    set({ isHydrated: true });
  },
}));