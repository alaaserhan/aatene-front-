"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StoreDetailsPage } from "./StoreDetailsPage";

export function AdminStoreDetailsPage({ storeId }: { storeId: number }) {
  const { locale, type } = useParams<{ locale: string; type: string }>();
  const router = useRouter();
  const listHref = `/${locale}/${type}/stores`;

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <Link
          href={listHref}
          className="text-sm font-medium text-blue-3 hover:text-blue-4 hover:underline"
        >
          العودة إلى إدارة المتاجر
        </Link>
      </header>
      <div className="flex-1 p-4 sm:p-6">
        <StoreDetailsPage
          storeId={storeId}
          onDeleteSuccess={() => {
            router.push(listHref);
          }}
        />
      </div>
    </div>
  );
}
