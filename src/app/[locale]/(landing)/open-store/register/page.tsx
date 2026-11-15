import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, USER_TYPE_COOKIE } from "@/src/auth/cookies";
import { MerchantSignupForm } from "@/src/auth/components/MerchantSignupForm";
import { MaintenanceGuard } from "@/src/components/providers/MaintenanceGuard";

export const metadata: Metadata = {
    title: "إنشاء حساب تاجر | أعطيني",
    description: "أنشئ حساب التاجر الخاص بك على أعطيني وابدأ بإعداد متجرك الإلكتروني مجانًا.",
    robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function MerchantRegisterPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const jar = await cookies();

    // Signed-in visitors go where the landing's CTA would have sent them.
    if (jar.get(AUTH_COOKIE)?.value) {
        redirect(
            jar.get(USER_TYPE_COOKIE)?.value === "client"
                ? `/${locale}/settings?tab=merchant`
                : `/${locale}/admin/stores/add`,
        );
    }

    return (
        <MaintenanceGuard>
            <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
                <MerchantSignupForm />
            </main>
        </MaintenanceGuard>
    );
}
