import DashboardNavbar from "@/src/components/(dashboard)/DashboardNavbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Role = "admin" | "merchant" | "user";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
params: Promise<{ locale: string; type: string; }>;
}) {
  const { locale, type } = await params;

  const jar = await cookies();
  const token = jar.get("token")?.value; // أي قيمة عندك
  const role = jar.get("user_type")?.value as Role | undefined;

  // ليس مسجلاً
  if (!token || !role) redirect(`/${locale}/login`);

  // منع دخول /admin لغير admin
  if (type === "admin" && role !== "admin") redirect(`/${locale}/dashboard`);

  return <>
  <DashboardNavbar navPrefix={type === "admin" ? "/admin" : "/dashboard"} />
  {children}</>;
}
