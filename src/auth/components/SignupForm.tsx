"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getAccount } from "../api";
import { signIn } from "../actions";
import { setAuthCookies } from "../cookies";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { FormInput } from "@/src/components/ui/FormInput";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { cn } from "@/src/lib/utils";
import { useRegister } from "../hooks";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiError } from "../types";
import { useLanguage } from "@/src/hooks/use-language";
import { BASE_URL } from "@/src/lib/config";
import { authLinkQuery, readPostLoginRedirect } from "../links";

const signupSchema = z
  .object({
    first_name: z.string().min(1, "الاسم الأول مطلوب"),
    last_name: z.string().min(1, "الاسم الأخير مطلوب"),
    email: z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
    terms: z.boolean().refine((val) => val === true, {
      message: "يجب الموافقة على الشروط",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const SIGNUP_PANEL_IMAGE = "/Frame%201261155080.svg";

const fieldClassName =
  "rounded-full border-gray-200 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#3d5e83] focus:ring-1 focus:ring-[#3d5e83]/20";

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

export function SignupForm() {
  const lang = useLanguage();
  const [countryCode, setCountryCode] = useState("+972");
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // `isSuccess` keeps the loading state through the gap between the API
  // resolving and the navigation actually unmounting this form.
  const { mutate: signupMutation, isPending, isSuccess } = useRegister();
  const isSubmitting = isPending || isSuccess;
  const router = useRouter();
  const queryClient = useQueryClient();
  // Initialize from the URL: if we landed here via the Google OAuth callback,
  // start in the loading state so we don't flash the form.
  const [isGoogleLoading, setIsGoogleLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("token");
  });
  // Filled in on mount rather than during render so SSR and hydration agree.
  const [authQuery, setAuthQuery] = useState("");

  useEffect(() => {
    setAuthQuery(authLinkQuery());
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");

    if (tokenParam) {
      setAuthCookies({ token: tokenParam });
      getAccount()
        .then((data) => {
          if (!data?.user) {
            setIsGoogleLoading(false);
            return;
          }
          signIn({ token: tokenParam, user: data.user, queryClient });
          router.push(readPostLoginRedirect(lang));
        })
        .catch(() => {
          setIsGoogleLoading(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Keep ?redirect= on the return URL so the pending target survives the
    // round-trip through Google and is still there when we land back here.
    const returnUrl =
      window.location.origin + window.location.pathname + authLinkQuery();
    window.location.href = `${BASE_URL}/auth/google?return_url=${encodeURIComponent(returnUrl)}`;
  };

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, terms, ...credentials } = data;
    const formattedPhone = `${countryCode}${data.phone.startsWith("0") ? data.phone.slice(1) : data.phone}`;

    signupMutation(
      { ...credentials, phone: formattedPhone },
      {
        onSuccess: () => {
          if (typeof window !== "undefined") {
            localStorage.setItem("new_user_registered", "true");
            localStorage.removeItem("notification_prompt_dismissed");
            localStorage.setItem("notifications_enabled", "false");
          }
        },
        onError: (error) => {
          form.clearErrors();
          if (error instanceof AxiosError) {
            const responseData = error.response?.data as ApiError | undefined;

            if (responseData?.errors && Object.keys(responseData.errors).length > 0) {
              Object.entries(responseData.errors).forEach(([field, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                  form.setError(field as keyof SignupFormData, {
                    type: "manual",
                    message: messages[0],
                  });
                }
              });
            } else if (responseData?.message) {
              form.setError("root", { message: responseData.message });
            }
          } else {
            toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
          }
        },
      }
    );
  };

  return (
    <div
      className="mx-auto flex w-full max-w-[1018px] flex-col overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.04),0_16px_48px_-4px_rgba(0,0,0,0.09)] lg:flex-row lg:items-stretch"
      dir="ltr"
    >
      {/* Image panel */}
      <div className="relative order-2 hidden h-65 w-full shrink-0 overflow-hidden sm:h-80 lg:order-1 lg:block lg:h-auto lg:w-115 lg:shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SIGNUP_PANEL_IMAGE}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
          draggable={false}
        />
      </div>

      {/* Form panel — no overflow-y-auto so it never scrolls internally */}
      <div
        className="order-1 flex w-full flex-col justify-center gap-4 p-6 sm:p-8 lg:order-2 lg:min-w-0 lg:flex-1 lg:gap-4.5 lg:p-10 xl:px-12 xl:py-10"
        dir="rtl"
      >
        {/* Header */}
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-bold leading-tight text-[#1c1c1c] lg:text-[27px]">
            إنشاء حساب جديد
          </h1>
          <p className="text-sm text-[#6b7280]">
            لديك حساب بالفعل؟{" "}
            <Link
              href={`/login${authQuery}`}
              className="font-semibold text-[#3D5E83] underline-offset-2 hover:underline"
            >
              تسجيل الدخول .
            </Link>
          </p>
        </div>

        {/* Google sign-in */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isSubmitting}
          variant="outline"
          className="h-11 w-full shrink-0 items-center gap-3 rounded-full border border-gray-200 bg-white text-sm font-medium text-[#3c4043] shadow-none transition-colors hover:bg-gray-50 hover:text-[#202124]"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="inline-flex items-center gap-2 text-sm leading-none">
              <span>المتابعة مع Google</span>
              <GoogleIcon className="h-[1.15em] w-[1.15em] shrink-0" />
            </span>
          )}
        </Button>

        {/* "أو" divider */}
        <div className="relative flex shrink-0 items-center gap-3" role="presentation">
          <div className="flex-1 border-t border-[#ebebeb]" />
          <span className="text-xs font-medium text-gray-400">أو</span>
          <div className="flex-1 border-t border-[#ebebeb]" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            {/* Name row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="الاسم الأول"
                    placeholder="أدخل اسمك الأول"
                    required
                    error={fieldState.error?.message}
                    className={fieldClassName}
                    containerClassName="space-y-2"
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="الاسم الأخير"
                    placeholder="أدخل اسمك الأخير"
                    required
                    error={fieldState.error?.message}
                    className={fieldClassName}
                    containerClassName="space-y-2"
                    {...field}
                  />
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  error={fieldState.error?.message}
                  className={fieldClassName}
                  containerClassName="space-y-2"
                  {...field}
                />
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <PhoneNumberInput
                  label="رقم الهاتف"
                  placeholder="أدخل رقم هاتفك"
                  required
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                  error={fieldState.error?.message}
                  roundedFull
                  height="h-10"
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
                    placeholder="٦ أحرف على الأقل"
                    required
                    error={fieldState.error?.message}
                    className={fieldClassName}
                    containerClassName="space-y-2"
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="تأكيد كلمة المرور"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                    error={fieldState.error?.message}
                    className={fieldClassName}
                    containerClassName="space-y-2"
                    {...field}
                  />
                )}
              />

            {/* Terms */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="group flex flex-row items-center space-x-0 space-y-0 rtl:space-x-reverse">
                  <FormControl>
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        "me-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border transition-colors",
                        "cursor-pointer",
                        field.value
                          ? "border-[#3d5e83] bg-[#3d5e83]"
                          : "border-gray-300 bg-white group-hover:border-[#3d5e83]/50"
                      )}
                      aria-checked={field.value}
                      role="checkbox"
                    >
                      {field.value && (
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  </FormControl>
                  <div className="space-y-0.5 leading-none">
                    <FormLabel className="cursor-pointer text-xs text-[#6b7280]">
                      لقد قرأت ووافقت على{" "}
                      <Link
                        href={`/${lang}/privacy-policy`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3d5e83] underline-offset-2 hover:underline"
                      >
                        سياسة الخصوصية
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Root-level API error */}
            {form.formState.errors.root && (
              <p className="text-right text-xs text-red-500">
                {form.formState.errors.root.message}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="h-11 w-full rounded-full bg-c2-primary text-sm font-semibold text-white transition-colors hover:bg-[#2c4461]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  جاري الإنشاء...
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
