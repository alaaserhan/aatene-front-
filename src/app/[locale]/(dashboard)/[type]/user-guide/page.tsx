import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserGuidePage } from "@/src/features/(dashboard)/user-guide/components/UserGuidePage";

export const metadata: Metadata = {
  title: "دليل المستخدم",
  description: "إضافة فيديوهات لمساعدة المستخدمين",
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale } = await params;
  const jar = await cookies();
  const role = jar.get("user_type")?.value;

  if (role !== "admin") {
    redirect(`/${locale}/admin/403`);
  }

  return <UserGuidePage />;
}
