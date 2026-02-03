import { Metadata } from "next";
import { ForgotPasswordForm } from "@/src/features/(web)/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
    title: "نسيت كلمة المرور",
    description: "استعادة كلمة المرور الخاصة بك",
};

export default function ForgotPasswordPage() {
    return (
        <div className="flex-1 flex flex-col bg-[#FAFAFA]">
            <ForgotPasswordForm />
        </div>
    );
}
