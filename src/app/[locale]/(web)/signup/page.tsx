import { Metadata } from "next";
import React from "react";
import { SignupForm } from "@/src/features/(web)/auth/components/SignupForm";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("signup");

export default function SignupPage() {
  return <SignupForm />;
}
