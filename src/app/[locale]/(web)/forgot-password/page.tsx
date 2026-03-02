import { Metadata } from "next";
import { ForgotPasswordForm } from "@/src/features/(web)/auth/components/ForgotPasswordForm";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("forgotPassword");

export default function ForgotPasswordPage() {
    return (
        <div className="flex-1 flex flex-col">
            <ForgotPasswordForm />
        </div>
    );
}
