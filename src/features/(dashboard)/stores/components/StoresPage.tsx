// src/features/(dashboard)/stores/components/StoresPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useGetStores, useUpdateStoreStatus } from "../hooks";
import { Store, StoreStatus } from "../api";
import { StoresAdminTable } from "./StoresAdminTable";
import { StoresTypeSidebar, StoreTypeFilter } from "./StoresTypeSidebar";
import { StoreEmptyState } from "./StoreEmptyState";
import { Input } from "@/src/components/ui/input";

const storeStatusTabs: {
  key: StoreStatus;
  label: string;
  activeClass: string;
  badgeClass: string;
}[] = [
  { key: "active", label: "تمت الموافقة عليه", activeClass: "border-emerald-500 text-emerald-500", badgeClass: "bg-emerald-500" },
  { key: "not-active", label: "قيد المراجعة", activeClass: "border-amber-400 text-amber-400", badgeClass: "bg-amber-400" },
  { key: "rejected", label: "مرفوض", activeClass: "border-red-500 text-red-500", badgeClass: "bg-red-500" },
];

export function StoresPage() {
  const router = useRouter();
  const { locale, type } = useParams<{ locale: string; type: string }>();

  const [statusTab, setStatusTab] = useState<StoreStatus>("active");
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
    p.set("status", "active");
    p.set("per_page", "1");
    if (typeFilter === "products") p.set("type", "products");
    if (typeFilter === "services") p.set("type", "services");
    if (searchQuery.trim()) p.set("name", searchQuery.trim());
    return p;
  }, [searchQuery, typeFilter]);
  const pendingCountParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", "not-active");
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
    if (key === "active") return activeCountData?.recordsFiltered ?? 0;
    if (key === "not-active") return pendingCountData?.recordsFiltered ?? 0;
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

  const { mutate: updateStatus } = useUpdateStoreStatus();

  const handleToggleStatus = (store: Store) => {
    if (store.status === "rejected") return;
    const next: StoreStatus = store.status === "active" ? "not-active" : "active";
    updateStatus({ id: store.id, payload: { status: next } });
  };

  const openDetails = (store: Store) => {
    if (locale && type) {
      router.push(`/${locale}/${type}/stores/${store.id}`);
    } else {
      router.push(`/admin/stores/${store.id}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
        <div className="flex items-center justify-between h-16 px-6">
          <h1 className="text-blue-4 font-semibold">إدارة المتاجر</h1>
          <Link
            href="/admin/stores/add"
            className="flex items-center gap-2 px-4 py-2 bg-[#3A5779] rounded-xs text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
          >
            <Plus className="w-5 h-5" />
            إضافة متجر
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-4">
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
            <div className="bg-white rounded-lg border border-gray-200 px-4 pt-3 pb-0 overflow-x-auto">
              <div className="flex items-center gap-6 min-w-min">
                {storeStatusTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStatusTab(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`flex cursor-pointer items-center gap-2 pb-3 border-b-[3px] transition-all duration-200 shrink-0 ${
                      statusTab === tab.key ? tab.activeClass : "border-transparent text-gray-2 hover:text-gray-600"
                    }`}
                  >
                    <span className="font-bold text-sm whitespace-nowrap">{tab.label}</span>
                    <span
                      className={`flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-bold text-white ${
                        statusTab === tab.key ? tab.badgeClass : "bg-gray-2"
                      }`}
                    >
                      {getTabCount(tab.key)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-white rounded-lg border border-gray-200 max-w-full">
              <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="ابحث باسم المتجر أو الوصف أو الإيميل..."
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
              onToggleStatus={handleToggleStatus}
              onViewDetails={openDetails}
            />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
