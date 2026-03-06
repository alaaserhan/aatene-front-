// src/features/auth/hooks.ts
"use client"; // Mutations are typically used in client components

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // Use App Router's router
import {
  loginUser,
  registerUser,
  logoutUser,
  sendCode,
  resendCode,
  verifyCode,
  resetPassword,
} from "./api";
import { useAuthStore } from "@/src/stores/auth-store"; // Import the store
import { toast } from "sonner"; // For specific success/error messages if needed
import { useLanguage } from "@/src/hooks/use-language"; // Import language hook

import { getFCMToken, deleteFCMToken } from "@/src/lib/firebase";

// --- Login Hook ---
export const useLogin = () => {
  const router = useRouter();
  const lang = useLanguage();
  const loginToStore = useAuthStore((state) => state.login); // Get login function from store

  return useMutation({
    mutationFn: async (credentials: import("./types").LoginCredentials) => {
      let device_token = credentials.device_token || await getFCMToken();
      if (!device_token) {
        device_token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      }
      return loginUser({ ...credentials, device_token, device_name: "Web" });
    },
    onSuccess: (data) => {
      // 1. Update the Zustand store with token and user data
      loginToStore(data.token, data.user);
      // 2. Redirect to dashboard or home page after successful login
      router.push(`/${lang}/`); // Redirect to language-specific home
      toast.success(data.message || "Login successful!");
    },
    onError: () => {
      // Axios interceptor already shows a toast for API errors
    },
  });
};

// --- Register Hook ---
export const useRegister = () => {
  const router = useRouter();
  const lang = useLanguage();
  const loginToStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (userData: import("./types").RegisterData) => {
      const device_token = await getFCMToken();
      return registerUser({ ...userData, device_token, device_name: "Web" });
    },
    onSuccess: (data) => {
      // 1. Log the user in immediately after registration
      loginToStore(data.token, data.user);
      // 2. Redirect to dashboard or home page
      router.push(`/${lang}/`);
      toast.success(data.message || "Registration successful!");
    },
    onError: () => {
    },
  });
};

// --- Logout Hook ---
export const useLogout = () => {
  const lang = useLanguage();
  const queryClient = useQueryClient();
  const logoutFromStore = useAuthStore((state) => state.logout); // Get logout function

  return useMutation({
    mutationFn: async () => {
      await deleteFCMToken();
      return logoutUser();
    },
    onSuccess: (data) => {
      logoutFromStore();
      queryClient.cancelQueries();
      queryClient.clear();
      toast.success(data.message || "Logout successful!");
      window.location.href = `/${lang}/login`;
    },
    onError: () => {
      logoutFromStore();
      queryClient.cancelQueries();
      queryClient.clear();
      window.location.href = `/${lang}/login`;
    },
  });
};
// --- Send Code Hook ---
export const useSendCode = () => {
  return useMutation({
    mutationFn: sendCode,
    onSuccess: (data) => {
      toast.success(data.message || "Code sent successfully!");
    },
  });
};

// --- Resend Code Hook ---
export const useResendCode = () => {
  return useMutation({
    mutationFn: resendCode,
    onSuccess: (data) => {
      toast.success(data.message || "Code resent successfully!");
    },
  });
};

// --- Verify Code Hook ---
export const useVerifyCode = () => {
  return useMutation({
    mutationFn: verifyCode,
    onSuccess: (data) => {
      toast.success(data.message || "Code verified successfully!");
    },
  });
};

// --- Reset Password Hook ---
export const useResetPassword = () => {
  const router = useRouter();
  const lang = useLanguage();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successfully!");
      router.push(`/${lang}/login`);
    },
  });
};
