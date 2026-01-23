// src/features/auth/hooks.ts
"use client"; // Mutations are typically used in client components

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // Use App Router's router
import {
  loginUser,
  registerUser,
  logoutUser,
  sendPasswordCode,
  verifyPasswordCode,
  resendOtpCode,
} from "./api";
import { useAuthStore } from "@/src/stores/auth-store"; // Import the store
import { toast } from "sonner"; // For specific success/error messages if needed
import { useLanguage } from "@/src/hooks/use-language"; // Import language hook

import { getFCMToken } from "@/src/lib/firebase";

// --- Login Hook ---
export const useLogin = () => {
  const router = useRouter();
  const lang = useLanguage();
  const loginToStore = useAuthStore((state) => state.login); // Get login function from store

  return useMutation({
    mutationFn: async (credentials: import("./types").LoginCredentials) => {
      const device_token = await getFCMToken();
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
    mutationFn: logoutUser,
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

// --- Send Password Reset Code Hook ---
export const useSendPasswordCode = () => {
  return useMutation({
    mutationFn: sendPasswordCode,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset code sent!");
      // Usually navigate to the Verify Code screen here, passing the 'id'
    },
    onError: () => {
    },
  });
};

// --- Verify Password Reset Code Hook ---
export const useVerifyPasswordCode = () => {
  const router = useRouter();
  const lang = useLanguage();
  // Potentially log user in if API returns token
  // const loginToStore = useAuthStore((state) => state.login);

  return useMutation({
    // mutationFn expects ONE argument, so wrap if needed
    mutationFn: (variables: { id: string; code: string; password?: string }) =>
      verifyPasswordCode(variables.id, {
        code: variables.code,
        password: variables.password,
      }),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successful!");
      // Redirect to login page
      router.push(`/${lang}/login`);
      // If verify logs the user in:
      // if (data.token && data.user) {
      //   loginToStore(data.token, data.user);
      //   router.push(`/${lang}/`);
      // }
    },
    onError: () => {
    },
  });
};

// --- Resend OTP Code Hook ---
export const useResendOtpCode = () => {
  return useMutation({
    mutationFn: resendOtpCode, // Assumes it takes only id
    onSuccess: (data) => {
      toast.success(data.message || "Code resent successfully!");
    },
    onError: () => {
    },
  });
};