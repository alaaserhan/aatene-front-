import { redirect } from "next/navigation";

export default async function RequestedServicesMyRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/my/requested-services`);
}
