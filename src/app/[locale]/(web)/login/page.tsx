import { Metadata } from "next";
import React from "react";
import { LoginForm } from "@/src/auth/components/LoginForm";
import { setStaticParamsLocale } from "next-international/server";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_REDIRECT_PARAM, sanitizeRedirectTarget } from "@/src/auth/links";

export const metadata: Metadata = generatePageMetadata("login");
export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const jar = await cookies();
  const token = jar.get("token")?.value;

  if (token) {
    const query = await searchParams;
    const raw = query[LOGIN_REDIRECT_PARAM];
    redirect(
      sanitizeRedirectTarget(Array.isArray(raw) ? raw[0] : raw) ?? `/${locale}`,
    );
  }

  return <LoginForm />;
}
