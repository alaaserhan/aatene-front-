// src/features/(dashboard)/storeSpecialties/components/StoreSpecialtiesPage.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Pagination } from "@/src/components/ui/Pagination";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import type { StoreType } from "../../stores/api";
import { useGetStoreSpecialties } from "../hooks";

const ITEMS_PER_PAGE = 10;

const TYPE_FILTERS: { value: StoreType; label: string }[] = [
  { value: "products", label: "المنتجات" },
  { value: "services", label: "الخدمات" },
];

export function StoreSpecialtiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<StoreType>("products");
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", String(ITEMS_PER_PAGE));
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    params.set("type", typeFilter);
    return params;
  }, [currentPage, searchQuery, typeFilter]);

  const { data, isLoading, isError } = useGetStoreSpecialties(queryParams);

  const specialties = data?.items || [];
  const totalPages = data?.pagination?.total_pages || 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-10">
      <header className="mt-6">
        <h1 className="text-2xl font-bold text-c2-neutral-950">تخصصات المتجر</h1>
      </header>

      <main className="flex-1 pb-8">
        <div className="my-6 flex flex-col gap-4">
          <Tabs
            value={typeFilter}
            onValueChange={(next) => {
              setTypeFilter(next as StoreType);
              setCurrentPage(1);
            }}
          >
            <TabsList className="w-full max-w-full justify-start overflow-x-auto">
              {TYPE_FILTERS.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value} className="min-w-30">
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative bg-white rounded-lg border border-gray-200 max-w-full">
            <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="ابحث باسم التخصص..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-10 h-12 border-none shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
          ) : isError ? (
            <div className="flex flex-col min-h-[300px] items-center justify-center">
              <p className="text-red-500">حدث خطأ أثناء جلب البيانات</p>
            </div>
          ) : specialties.length === 0 ? (
            <div className="flex flex-col min-h-[300px] items-center justify-center">
              <p className="text-gray-2">لا توجد تخصصات لعرضها</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead className="bg-[#EEF2F6] border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">
                        كود المتجر
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-right whitespace-nowrap">
                        المتجر
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-right whitespace-nowrap">
                        اسم التخصص
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {specialties.map((specialty) => (
                      <tr
                        key={specialty.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                          #{specialty.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                              {specialty.logo_url ? (
                                <Image
                                  src={specialty.logo_url}
                                  alt={specialty.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-xs text-gray-2">
                                  {specialty.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium line-clamp-2 leading-relaxed">
                              {specialty.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm line-clamp-2 leading-relaxed">
                            {specialty.speciality}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 mt-auto">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
