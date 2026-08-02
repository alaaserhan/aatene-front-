import { redirect } from "next/navigation";

/**
 * The full-wizard edit page was replaced by the store settings page, where
 * each section saves independently. Old links keep working.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; type: string; storeId: string }>;
}) {
  const { locale, type, storeId } = await params;
  redirect(`/${locale}/${type}/stores/${storeId}/settings`);
}
