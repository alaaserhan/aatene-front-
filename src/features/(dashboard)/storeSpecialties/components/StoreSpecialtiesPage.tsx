// src/features/(dashboard)/storeSpecialties/components/StoreSpecialtiesPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Pagination } from "@/src/components/ui/Pagination";
import { useGetStoreSpecialties } from "../hooks";

const ITEMS_PER_PAGE = 10;

export function StoreSpecialtiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", String(ITEMS_PER_PAGE));
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    return params;
  }, [currentPage, searchQuery]);

  const { data, isLoading, isError } = useGetStoreSpecialties(queryParams);

  const specialties = data?.items || [];
  const totalPages = data?.pagination?.total_pages || 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-10">
      <header className="mt-6 pb-0">
        <div className="heading-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="heading-1">تخصصات المتجر</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-8">
        <div className="my-6">
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
                      <th className="px-6 py-4 text-xs font-medium text-right whitespace-nowrap">
                        اسم التخصص
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">
                        عدد المتاجر
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {specialties.map((specialty) => (
                      <tr
                        key={specialty.speciality}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium line-clamp-2 leading-relaxed">
                            {specialty.speciality}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-sm">
                            {specialty.stores_count || 0}
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
