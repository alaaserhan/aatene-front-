"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/src/auth/session";
import { StoreDetailsPage } from "./StoreDetailsPage";
import { StoreAdminPreviewPage } from "./StoreAdminPreviewPage";

export function AdminStoreDetailsPage({ storeId }: { storeId: number }) {
  const { locale, type } = useParams<{ locale: string; type: string }>();
  const router = useRouter();
  const { user, isPending: isSessionPending } = useSession();
  const isAdmin = user?.user_type === "admin";
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
        {/* Wait for the session so the admin preview never flashes the merchant page */}
        {isSessionPending ? (
          <div className="flex items-center justify-center min-h-100 bg-white rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-c2-primary" />
          </div>
        ) : isAdmin ? (
          <StoreAdminPreviewPage storeId={storeId} />
        ) : (
          <StoreDetailsPage
            storeId={storeId}
            onDeleteSuccess={() => {
              router.push(listHref);
            }}
          />
        )}
      </div>
    </div>
  );
}
