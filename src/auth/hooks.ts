"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginUser,
  registerUser,
  sendCode,
  resendCode,
  verifyCode,
  resetPassword,
} from "./api";
import type { LoginCredentials, RegisterData } from "./types";
import { useLanguage } from "@/src/hooks/use-language";
import { signIn, signOut } from "./actions";

/**
 * Stable per-device identifier sent with login/register. Persisted in
 * localStorage so a returning visitor presents the same device token —
 * the backend uses it for session management / push targeting.
 *
 * FCM token replaces this when available (see useLogin below).
 */
function getOrCreateDeviceToken(): string {
  if (typeof window === "undefined") {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 15)}`;
  }
  const KEY = "device_token";
  let value = localStorage.getItem(KEY);
  if (!value) {
    value = `${Date.now()}-${Math.random().toString(36).slice(2, 15)}`;
    localStorage.setItem(KEY, value);
  }
  return value;
}

export const useLogin = () => {
  const router = useRouter();
  const lang = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      loginUser({
        ...credentials,
        device_token: credentials.device_token || getOrCreateDeviceToken(),
        device_name: credentials.device_name || "Web",
      }),
    onSuccess: (data) => {
      signIn({ token: data.token, user: data.user, queryClient });
      router.replace(`/${lang}/`);
    },
    // Errors are surfaced by the axios interceptor; per-form handlers can
    // override via the mutation's options.
  });
};

export const useRegister = () => {
  const router = useRouter();
  const lang = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterData) =>
      registerUser({
        ...userData,
        device_token: userData.device_token || getOrCreateDeviceToken(),
        device_name: userData.device_name || "Web",
      }),
    onSuccess: (data) => {
      signIn({ token: data.token, user: data.user, queryClient });

      // First-run flags for the post-signup notification prompt.
      if (typeof window !== "undefined") {
        localStorage.setItem("new_user_registered", "true");
        localStorage.removeItem("notification_prompt_dismissed");
        localStorage.setItem("notifications_enabled", "false");
      }

      router.replace(`/${lang}/`);
    },
  });
};

export const useLogout = () => {
  const lang = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut({ queryClient, redirectTo: `/${lang}/login` }),
    // Toast intentionally omitted — the page is about to navigate away.
  });
};

export const useSendCode = () =>
  useMutation({
    mutationFn: sendCode,
    onSuccess: (data) => {
      toast.success(data.message || "Code sent successfully!");
    },
  });

export const useResendCode = () =>
  useMutation({
    mutationFn: resendCode,
    onSuccess: (data) => {
      toast.success(data.message || "Code resent successfully!");
    },
  });

export const useVerifyCode = () =>
  useMutation({
    mutationFn: verifyCode,
    onSuccess: (data) => {
      toast.success(data.message || "Code verified successfully!");
    },
  });

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
