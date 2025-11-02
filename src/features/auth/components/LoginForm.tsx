"use client";

import React from "react";
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
import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { useLogin } from "../hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const loginSchema = z.object({
  login: z.string().min(1, "البريد الإلكتروني أو الهاتف مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

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

  const onSubmit = (data: LoginFormData) => {
    loginMutation(data);
  };

  return (
    <Card className="grid overflow-hidden rounded-xl shadow-lg lg:grid-cols-2 border-none">
      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full space-y-6">
          <div className="text-center lg:text-start">
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-1">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              ليس لديك حساب؟
              <Link href="/signup" className="underline hover:text-primary">
                إنشاء حساب جديد
              </Link>
            </CardDescription>
          </div>

          <Button variant="outline" className="w-full gradient-blue gap-3 text-white rounded-full p-3 sm:p-4 text-sm sm:p-4">
            <span>Google</span>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني أو الهاتف</FormLabel>
                    <FormControl>
                      <FormInput
                        type="text"
                        placeholder="أدخل بريدك الإلكتروني أو هاتفك"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <FormInput
                        type="password"
                        placeholder="أدخل كلمة المرور الخاصة بك"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full gradient-blue" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "جاري التسجيل..." : "تسجيل الدخول"}
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