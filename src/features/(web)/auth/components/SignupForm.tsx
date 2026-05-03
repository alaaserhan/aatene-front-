// src/app/(web)/signup/components/SignupForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuthStore } from "@/src/stores/auth-store";
import { getAccount } from "../../settings/api";
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
import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { useRegister } from "../hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiError, User } from "../types";

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

export function SignupForm() {
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

  const { mutate: signupMutation, isPending } = useRegister();
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");

    if (tokenParam) {
      setIsGoogleLoading(true);
      Cookies.set("token", tokenParam, {
        expires: 365,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      getAccount().then((data) => {
        if (data?.user) {
          storeLogin(tokenParam, data.user as unknown as User);
          router.push("/");
        } else {
          setIsGoogleLoading(false);
        }
      }).catch(() => {
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

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, terms, ...credentials } = data;

    // Combine country code and phone number. 
    // If the phone starts with 0, we usually strip it when prepending country code, 
    // but the backend error suggests it might want a specific format. 
    // Let's prepend the code.
    const formattedPhone = `${countryCode}${data.phone.startsWith('0') ? data.phone.slice(1) : data.phone}`;

    signupMutation({ ...credentials, phone: formattedPhone }, {
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
                // نضع الخطأ على الحقل فقط - الـ toast يتكفل به الـ axios interceptor تلقائياً
                form.setError(field as keyof SignupFormData, {
                  type: "manual",
                  message: messages[0],
                });
              }
            });
          } else if (responseData?.message) {
            form.setError("root", { message: responseData.message });
          }
          // لا نعرض toast هنا - الـ axios interceptor يعرضه مرة واحدة تلقائياً
        } else {
          toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
        }
      },
    });
  };

  return (
    <Card className="grid overflow-hidden rounded-xl shadow-none lg:grid-cols-2 border-none">
      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full space-y-6">
          <div className="text-center lg:text-start">
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-1">
              إنشاء حساب جديد
            </CardTitle>
            <CardDescription className="text-gray-2 text-sm">
              لديك حساب بالفعل؟
              <Link href="/login" className="underline hover:text-primary">
                تسجيل الدخول
              </Link>
            </CardDescription>
          </div>

          <Button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isPending}
            variant="outline" 
            className="w-full bg-blue-3 hover:text-white gap-3 text-white rounded-full p-3 sm:p-5"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span>تسجيل الدخول بواسطة جوجل</span>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                أو أكمل بواسطة
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="الاسم الأول"
                      placeholder="أدخل اسمك الأول"
                      required
                      error={fieldState.error?.message}
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
                      {...field}
                    />
                  )}
                />
              </div>
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
                    {...field}
                  />
                )}
              />
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
                    {...field}
                    rounded="rounded-sm"
                    height="h-11"
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
                    placeholder="أدخل كلمة مرور قوية"
                    required
                    error={fieldState.error?.message}
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
                    {...field}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse group">
                    <FormControl>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center ms-2 flex-shrink-0",
                          "cursor-pointer",
                          field.value
                            ? "bg-blue-5 border-blue-4"
                            : "bg-white border-gray-300 group-hover:border-gray-2"
                        )}
                        aria-checked={field.value}
                        role="checkbox"
                      >
                        {field.value && (
                          <svg
                            className="w-4 h-4 text-blue-4"
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
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs text-gray-2 cursor-pointer mx-2">
                        لقد قرأت و وافقت على
                        <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                          سياسة الخصوصية
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-blue-3 p-3 sm:p-5 hover:text-white" disabled={isPending}>
                {isPending ? "جاري الإنشاء..." : "إنشاء حساب"}
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>

      <div className="relative hidden h-full w-full bg-muted lg:block">
        <Image
          src="/singup.png"
          alt="Signup illustration"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
    </Card>
  );
}