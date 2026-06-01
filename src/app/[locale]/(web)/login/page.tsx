import { Metadata } from "next";
import React from "react";
import { LoginForm } from "@/src/features/(web)/auth/components/LoginForm";
import { setStaticParamsLocale } from "next-international/server";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = generatePageMetadata("login");
export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const jar = await cookies();
  const token = jar.get("token")?.value;

  if (token) {
    redirect(`/${locale}`);
  }

  return <LoginForm />;
}
