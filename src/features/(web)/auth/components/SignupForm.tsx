// src/app/(web)/signup/components/SignupForm.tsx
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
import { Checkbox } from "@/src/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { useRegister } from "../hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiError } from "../types";

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

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, terms, ...credentials } = data;

    signupMutation(credentials, {
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
                toast.error(messages[0]);
              }
            });
          } else if (responseData?.message) {
            toast.error(responseData.message);
            form.setError("root", { message: responseData.message });
          }
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
                  <FormInput
                    label="رقم الهاتف"
                    type="tel"
                    placeholder="أدخل رقم هاتفك"
                    required
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs text-gray-2 cursor-pointer">
                        لقد قرأت ووافقت على
                        <Link href="/terms" className="underline hover:text-primary">
                          شروط الخدمة
                        </Link>
                        و
                        <Link href="/privacy" className="underline hover:text-primary">
                          سياسة الخصوصية
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full gradient-blue" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "جاري الإنشاء..." : "إنشاء حساب"}
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