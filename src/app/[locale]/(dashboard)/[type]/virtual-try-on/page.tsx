import { TryOnSettingsPage } from "@/src/features/(dashboard)/virtual-try-on/components/TryOnSettingsPage";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const metadata = {
  title: "إعدادات التجربة الافتراضية — لوحة التحكم",
};

export default async function AdminTryOnSettingsPage() {
  const jar = await cookies();
  if (jar.get("user_type")?.value !== "admin") notFound();

  return <TryOnSettingsPage />;
}
