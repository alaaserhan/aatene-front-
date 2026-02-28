import DashboardNavbar from "@/src/components/(dashboard)/DashboardNavbar";
import { StoreGuard } from "@/src/components/providers/StoreGuard";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

type Role = "admin" | "merchant" | "user";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; type: string; }>;
}) {
  const { locale, type } = await params;

  if (type !== "admin") {
    notFound();
  }

  const jar = await cookies();
  const token = jar.get("token")?.value;
  const role = jar.get("user_type")?.value as Role | undefined;

  if (!token || !role) redirect(`/${locale}/login`);

  if (type === "admin" && role !== "admin" && role !== "merchant") {
    redirect(`/${locale}`);
  }

  return <>
    <DashboardNavbar navPrefix="/admin" />
    <StoreGuard>
      <div className="max-w-[2500px] mx-auto">
        {children}
      </div>
    </StoreGuard>
  </>;
}
