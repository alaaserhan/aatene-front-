import { Metadata } from "next";
import React from "react";
import { SignupForm } from "@/src/features/(web)/auth/components/SignupForm";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = generatePageMetadata("signup");
export const dynamic = "force-dynamic";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const jar = await cookies();
  const token = jar.get("token")?.value;

  if (token) {
    redirect(`/${locale}`);
  }

  return <SignupForm />;
}
