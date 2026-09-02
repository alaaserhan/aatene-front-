import { Metadata } from "next";
import { ForgotPasswordForm } from "@/src/auth/components/ForgotPasswordForm";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = generatePageMetadata("forgotPassword");
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
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

    return (
        <div className="flex-1 flex flex-col">
            <ForgotPasswordForm />
        </div>
    );
}
