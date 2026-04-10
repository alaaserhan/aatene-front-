import { Metadata } from "next";
import AddEditRequestedServicePage from "@/src/features/(web)/requested-services/components/AddEditRequestedServicePage";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = generatePageMetadata("createRequestedService");

export default async function CreateRequestedServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const jar = await cookies();
  const token = jar.get("token")?.value;

  if (!token) {
    redirect(`/${locale}/login`);
  }

  return <AddEditRequestedServicePage />;
}
