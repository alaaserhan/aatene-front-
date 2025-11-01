"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/src/i18n/provider";
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

// (1) ⭐️ عرّفنا المفاتيح اللي الـ Schema محتاجها
type ValidationKey = "login_required" | "password_min";

// (2) ⭐️ عرّفنا الـ Schema إنه عايز دالة بتاخد المفاتيح دي
const loginSchema = (tValidation: (key: ValidationKey) => string) => z.object({
  login: z.string().min(1, tValidation('login_required')),
  password: z.string().min(6, tValidation('password_min')),
});

type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;

export function LoginForm() {
  const router = useRouter();
  const t = useScopedI18n('login');
  const tValidation = useScopedI18n('validation');
  const tGeneral = useScopedI18n('general');

  // (3) ⭐️ عملنا دالة وسيطة بسيطة
  // الدالة دي بتاخد المفاتيح المحددة (ValidationKey) وترجع string
  const simpleTValidation = (key: ValidationKey): string => {
    return tValidation(key); // نستدعي الدالة الأصلية
  };

  const form = useForm<LoginFormData>({
    // (4) ⭐️ مررنا الدالة الوسيطة للـ resolver
    resolver: zodResolver(loginSchema(simpleTValidation)),
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
              {t('title')}
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              {t('description_no_link')}
              <Link href="/signup" className="underline hover:text-primary">
                {t('create_account')}
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
                {tGeneral('or_continue_with')}
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
                    <FormLabel>{t('email_phone_label')}</FormLabel>
                    <FormControl>
                      <FormInput
                        type="text"
                        placeholder={t('email_phone_placeholder')}
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
                    <FormLabel>{t('password_label')}</FormLabel>
                    <FormControl>
                      <FormInput
                        type="password"
                        placeholder={t('password_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full gradient-blue" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? t('loading_button') : t('submit_button')}
              </Button>
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {t('forgot_password')}
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>

      <div className="relative hidden h-full w-full bg-muted lg:block">
        <Image
          src="/images/login.png"
          alt="Login illustration"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
    </Card>
  );
}