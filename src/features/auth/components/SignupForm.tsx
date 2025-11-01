"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
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
import { Checkbox } from "@/src/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { useRegister } from "../hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiError } from "../types";

type ValidationKey =
  | "first_name_required"
  | "last_name_required"
  | "email_required"
  | "email_invalid"
  | "phone_required"
  | "password_required"
  | "password_min"
  | "confirm_password_required"
  | "passwords_not_match"
  | "terms_required";

const signupSchema = (tValidation: (key: string) => string) =>
  z.object({
    first_name: z.string().min(1, tValidation("first_name_required")),
    last_name: z.string().min(1, tValidation("last_name_required")),
    email: z.string().min(1, tValidation("email_required")).email(tValidation("email_invalid")),
    phone: z.string().min(1, tValidation("phone_required")),
    password: z.string().min(6, tValidation("password_min")),
    confirmPassword: z.string().min(6, tValidation("confirm_password_required")),
    terms: z.boolean().refine((val) => val === true, {
      message: tValidation("terms_required"),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: tValidation("passwords_not_match"),
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<ReturnType<typeof signupSchema>>;

export function SignupForm() {
  const t = useScopedI18n('signup');
  const tValidation = useScopedI18n('validation');
  const tGeneral = useScopedI18n('general');

  const simpleTValidation = (key: string): string => {
    return tValidation(key as ValidationKey);
  };

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema(simpleTValidation)),
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
          toast.error(tValidation("general_error"));
        }
      },
    });
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
              <Link href="/login" className="underline hover:text-primary">
                {t('login_link')}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  name="first_name"
                  label={t('first_name_label')}
                  placeholder={t('first_name_placeholder')}
                />
                <FormInput
                  name="last_name"
                  label={t('last_name_label')}
                  placeholder={t('last_name_placeholder')}
                />
              </div>
              <FormInput
                name="email"
                type="email"
                label={t('email_label')}
                placeholder={t('email_placeholder')}
              />
              <FormInput
                name="phone"
                type="tel"
                label={t('phone_label')}
                placeholder={t('phone_placeholder')}
              />
              <FormInput
                name="password"
                type="password"
                label={t('password_label')}
                placeholder={t('password_placeholder')}
              />
              <FormInput
                name="confirmPassword"
                type="password"
                label={t('confirm_password_label')}
                placeholder={t('confirm_password_placeholder')}
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
                      <FormLabel className="text-xs text-gray-600 cursor-pointer">
                        {t('terms_label_part1')}
                        <Link href="/terms" className="underline hover:text-primary">
                          {t('terms_link_text')}
                        </Link>
                        {t('terms_label_part2')}
                        <Link href="/privacy" className="underline hover:text-primary">
                          {t('privacy_link_text')}
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full gradient-blue" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? t('loading_button') : t('submit_button')}
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