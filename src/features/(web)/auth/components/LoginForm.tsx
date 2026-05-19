"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuthStore } from "@/src/stores/auth-store";
import { getAccount } from "../../settings/api";
import { User } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Form, FormField } from "@/src/components/ui/form";
import { FormInput } from "@/src/components/ui/FormInput";
import { useLogin } from "../hooks";
import { getFCMToken } from "@/src/lib/firebase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LOGIN_AUTH_REQUIRED_REASON } from "@/src/lib/auth-links";

/** لوحة يسار البطاقة — نفس ملف Figma */
const LOGIN_PANEL_IMAGE = "/Frame%201261155079.svg";

const loginSchema = z.object({
  login: z.string().min(1, "البريد الإلكتروني أو الهاتف مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const generateFallbackToken = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

type LoginFormData = z.infer<typeof loginSchema>;

const fieldClassName =
  "rounded-xl border-gray-200 py-3.5 text-sm focus:border-[#3d5e83] focus:ring-1 focus:ring-[#3d5e83]/20";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const { mutate: loginMutation, isPending } = useLogin();
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    const reason = searchParams.get("reason");

    if (reason === LOGIN_AUTH_REQUIRED_REASON) {
      queueMicrotask(() => {
        toast.error("يجب تسجيل الدخول أولاً لإكمال هذا الإجراء.");
      });
      searchParams.delete("reason");
      const nextQuery = searchParams.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }

    if (tokenParam) {
      setIsGoogleLoading(true);
      Cookies.set("token", tokenParam, {
        expires: 365,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      getAccount()
        .then((data) => {
          if (data?.user) {
            storeLogin(tokenParam, data.user as unknown as User);
            router.push("/");
          } else {
            setIsGoogleLoading(false);
          }
        })
        .catch(() => {
          setIsGoogleLoading(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const returnUrl = window.location.origin + window.location.pathname;
    window.location.href = `https://backend.aatene.com/auth/google?return_url=${returnUrl}`;
  };

  const onSubmit = async (data: LoginFormData) => {
    let device_token = generateFallbackToken();
    try {
      const fcmToken = await getFCMToken();
      if (fcmToken) device_token = fcmToken;
    } catch {
      /* fallback */
    }
    loginMutation({ ...data, device_token });
  };

  return (
    <div
      className="mx-auto flex w-full max-w-[1018px] flex-col overflow-hidden rounded-[10px] border border-[#e8e8e8] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] lg:h-[580px] lg:flex-row"
      dir="ltr"
    >
      {/* يسار: صورة Figma */}
      <div className="relative order-2 hidden h-[240px] w-full shrink-0 overflow-hidden sm:h-[300px] lg:order-1 lg:block lg:h-[580px] lg:w-[509px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGIN_PANEL_IMAGE}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
          draggable={false}
        />
      </div>

      {/* يمين: النموذج */}
      <div
        className="order-1 flex w-full flex-col justify-center gap-7 p-8 sm:p-9 lg:order-2 lg:h-[580px] lg:w-[509px] lg:shrink-0 lg:gap-[33px] lg:p-[50px]"
        dir="rtl"
      >
        <div className="space-y-2 text-right">
          <h1 className="text-[28px] font-bold leading-tight text-[#1c1c1c] lg:text-[32px]">
            تسجيل الدخول
          </h1>
          <p className="text-sm text-[#6b7280]">
            ليس لديك حساب ،{" "}
            <Link
              href="/signup"
              className="font-medium text-[#3d5e83] underline-offset-2 hover:underline"
            >
              إنشاء واحد جديد
            </Link>
          </p>
        </div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isPending}
          variant="outline"
          className="h-12 w-full items-center gap-3 rounded-full border-0 bg-[#ececec] text-base font-normal text-[#3c4043] shadow-none hover:bg-[#e2e2e2] hover:text-[#202124]"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="inline-flex items-center gap-2.5 text-base leading-none">
              <span>Google</span>
              <GoogleIcon className="h-[1.35em] w-[1.35em] shrink-0 scale-110 -translate-y-px" />
            </span>
          )}
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7 lg:gap-[33px]">
            <div className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="login"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="بريدك الإلكتروني أو الهاتف"
                    type="text"
                    placeholder="أدخل بريدك الإلكتروني أو الهاتف"
                    error={fieldState.error?.message}
                    className={fieldClassName}
                    containerClassName="space-y-2"
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="كلمة المرور"
                    type="password"
                    placeholder="أدخل كلمة المرور الخاصة بك"
                    error={fieldState.error?.message}
                    className={fieldClassName}
                    containerClassName="space-y-2"
                    {...field}
                  />
                )}
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[#3d5e83] text-base font-semibold text-white hover:bg-[#2c4461]"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    جاري تسجيل الدخول...
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
              <Link
                href="/forgot-password"
                className="text-sm text-[#6b7280] hover:text-[#3d5e83] hover:underline"
              >
                نسيت كلمة السر
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
