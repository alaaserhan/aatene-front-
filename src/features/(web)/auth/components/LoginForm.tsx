// src/app/(web)/login/components/LoginForm.tsx
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
import {
  Form,
  FormField,
} from "@/src/components/ui/form";
import { FormInput } from "@/src/components/ui/FormInput";
import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { useLogin } from "../hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const loginSchema = z.object({
  login: z.string().min(1, "البريد الإلكتروني أو الهاتف مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const generateFallbackToken = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

type LoginFormData = z.infer<typeof loginSchema>;

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

    if (tokenParam) {
      setIsGoogleLoading(true);
      Cookies.set("token", tokenParam, { expires: 365, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
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
    window.location.href = `https://aatene.dev/auth/google?return_url=${returnUrl}`;
  };

  const onSubmit = async (data: LoginFormData) => {
    const device_token = generateFallbackToken();
    loginMutation({ ...data, device_token });
  };

  return (
    <Card className="grid overflow-hidden rounded-xl shadow-none lg:grid-cols-2 border-none">
      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full space-y-6">
          <div className="text-center lg:text-start">
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-1">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-gray-2 text-sm">
              ليس لديك حساب؟
              <Link href="/signup" className="underline hover:text-primary">
                إنشاء حساب جديد
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
              <FormField
                control={form.control}
                name="login"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="البريد الإلكتروني أو الهاتف"
                    type="text"
                    placeholder="أدخل بريدك الإلكتروني أو هاتفك"
                    error={fieldState.error?.message}
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
                    {...field}
                  />
                )}
              />
              <Button type="submit" className="w-full bg-blue-3 p-3 sm:p-5 hover:text-white" disabled={isPending}>
                {isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  نسيت كلمة السر؟
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>

      <div className="relative hidden h-full w-full bg-muted lg:block">
        <Image
          src="/login.png"
          alt="Login illustration"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
    </Card>
  );
}