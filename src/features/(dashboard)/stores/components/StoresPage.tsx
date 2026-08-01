// src/features/(dashboard)/stores/components/StoresPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useGetStores, useUpdateStoreShown } from "../hooks";
import { Store, StoreStatus } from "../api";
import { StoresAdminTable } from "./StoresAdminTable";
import { StoresTypeSidebar, StoreTypeFilter } from "./StoresTypeSidebar";
import { StoreEmptyState } from "./StoreEmptyState";
import { Input } from "@/src/components/ui/input";
import { useAuthStore } from "@/src/stores/auth-store";
import { Button } from "@/src/components/ui/button";
import { StatusTabs, REVIEW_STATUS_TABS } from "@/src/components/(dashboard)/StatusTabs";

export function StoresPage() {
  const router = useRouter();
  const { locale, type } = useParams<{ locale: string; type: string }>();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.user_type === "admin";
  const isMerchant = user?.user_type === "merchant";

  const statusParam = searchParams.get("status") as StoreStatus | null;
  const initialStatusTab: StoreStatus =
    statusParam && REVIEW_STATUS_TABS.some((tab) => tab.key === statusParam) ? statusParam : "approved";

  const [statusTab, setStatusTab] = useState<StoreStatus>(initialStatusTab);
  const [typeFilter, setTypeFilter] = useState<StoreTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const listParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(currentPage));
    p.set("per_page", "10");
    p.set("status", statusTab);
    if (typeFilter === "products") p.set("type", "products");
    if (typeFilter === "services") p.set("type", "services");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [currentPage, statusTab, searchQuery, typeFilter]);

  const { data, isLoading } = useGetStores(listParams);
  const stores = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.recordsFiltered ?? 0) / 10));

  const activeCountParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", "approved");
    p.set("per_page", "1");
    if (typeFilter === "products") p.set("type", "products");
    if (typeFilter === "services") p.set("type", "services");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [searchQuery, typeFilter]);
  const pendingCountParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", "pending");
    p.set("per_page", "1");
    if (typeFilter === "products") p.set("type", "products");
    if (typeFilter === "services") p.set("type", "services");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [searchQuery, typeFilter]);
  const rejectedCountParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", "rejected");
    p.set("per_page", "1");
    if (typeFilter === "products") p.set("type", "products");
    if (typeFilter === "services") p.set("type", "services");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [searchQuery, typeFilter]);

  const sidebarAllCountParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("per_page", "1");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [searchQuery]);
  const sidebarProductsCountParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("per_page", "1");
    p.set("type", "products");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [searchQuery]);
  const sidebarServicesCountParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("per_page", "1");
    p.set("type", "services");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [searchQuery]);

  const { data: sidebarAllCountData } = useGetStores(sidebarAllCountParams, {
    staleTime: 30_000,
  });
  const { data: sidebarProductsCountData } = useGetStores(
    sidebarProductsCountParams,
    { staleTime: 30_000 }
  );
  const { data: sidebarServicesCountData } = useGetStores(
    sidebarServicesCountParams,
    { staleTime: 30_000 }
  );

  const { data: activeCountData } = useGetStores(activeCountParams, { staleTime: 30_000 });
  const { data: pendingCountData } = useGetStores(pendingCountParams, { staleTime: 30_000 });
  const { data: rejectedCountData } = useGetStores(rejectedCountParams, { staleTime: 30_000 });

  const getTabCount = (key: StoreStatus) => {
    if (key === "approved") return activeCountData?.recordsFiltered ?? 0;
    if (key === "pending") return pendingCountData?.recordsFiltered ?? 0;
    return rejectedCountData?.recordsFiltered ?? 0;
  };

  const totalStoresAcrossTabs =
    (activeCountData?.recordsFiltered ?? 0) +
    (pendingCountData?.recordsFiltered ?? 0) +
    (rejectedCountData?.recordsFiltered ?? 0);

  const isTrueEmpty =
    activeCountData !== undefined &&
    pendingCountData !== undefined &&
    rejectedCountData !== undefined &&
    totalStoresAcrossTabs === 0 &&
    !searchQuery.trim();

  const { mutate: updateShown } = useUpdateStoreShown();

  const handleToggleShown = (store: Store) => {
    if (store.status === "rejected") return;
    const currentlyVisible = store.shown !== false;
    updateShown({ id: store.id, payload: { shown: !currentlyVisible } });
  };

  const openDetails = (store: Store) => {
    if (locale && type) {
      router.push(`/${locale}/${type}/stores/${store.id}`);
    } else {
      router.push(`/admin/stores/${store.id}`);
    }
  };

  const addStoreHref =
    locale && type ? `/${locale}/${type}/stores/add` : "/admin/stores/add";

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
      <header className="mt-6 pb-0">
        <div className="heading-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="heading-1">إدارة المتاجر</h1>
          <div className="flex flex-row gap-4 lg:gap-6">
            {/* TODO: this should be a link not a nested button */}
            <Link
            href={addStoreHref}

            >
              <Button size="lg" className="bg-blue-3 text-white gap-2">
                <Plus className="size-6" />
                <span className="pt-1">إضافة متجر</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 my-6 space-y-4">
        {isTrueEmpty ? (
          <StoreEmptyState />
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <aside className="w-full lg:w-72 shrink-0 order-1 lg:order-none">
              <StoresTypeSidebar
                totalCount={sidebarAllCountData?.recordsFiltered ?? 0}
                productsCount={sidebarProductsCountData?.recordsFiltered ?? 0}
                servicesCount={sidebarServicesCountData?.recordsFiltered ?? 0}
                selected={typeFilter}
                onSelect={(v) => {
                  setTypeFilter(v);
                  setCurrentPage(1);
                }}
              />
            </aside>
            <div className="flex-1 min-w-0 space-y-4 w-full order-2 lg:order-none">
            <StatusTabs<StoreStatus>
              activeKey={statusTab}
              onChange={(key) => {
                setStatusTab(key);
                setCurrentPage(1);
              }}
              getCount={getTabCount}
              className="bg-white rounded-lg border border-gray-200"
            />

            <div className="relative bg-white rounded-lg border border-gray-200 max-w-full">
              <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="ابحث باسم المتجر أو الإيميل..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pr-10 h-12 border-none shadow-none focus-visible:ring-0"
              />
            </div>

            <StoresAdminTable
              stores={stores}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              listStatus={statusTab}
              onToggleShown={handleToggleShown}
              onViewDetails={openDetails}
              canToggleStoreShown={isAdmin || isMerchant}
            />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
