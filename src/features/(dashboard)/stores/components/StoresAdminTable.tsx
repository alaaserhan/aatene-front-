"use client";

import Image from "next/image";
import { Eye, Loader2 } from "lucide-react";
import { Store, StoreStatus } from "../api";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { Pagination } from "@/src/components/ui/Pagination";
import { formatDate } from "@/src/lib/date-helper";

function displayViews(store: Store): number {
  const raw = store.view_count ?? store.views_count;
  if (raw === null || raw === undefined || raw === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function displayFollowers(store: Store): number {
  const raw = store.followers_count;
  if (raw === null || raw === undefined || raw === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function displayFavorites(store: Store): number | null {
  const raw =
    store.favorites_count ?? store.favorite_count ?? store.favourites_count;
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

interface StoresAdminTableProps {
  stores: Store[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  listStatus: StoreStatus;
  onToggleStatus: (store: Store) => void;
  onViewDetails: (store: Store) => void;
}

export function StoresAdminTable({
  stores,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  listStatus,
  onToggleStatus,
  onViewDetails,
}: StoresAdminTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col min-h-[300px] items-center justify-center bg-white rounded-lg border border-gray-200">
        <p className="text-gray-2">لا توجد متاجر للعرض</p>
      </div>
    );
  }

  const showRejectedCols = listStatus === "rejected";
  const canToggleStatus = listStatus !== "rejected";

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#EEF2F6] border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-sm font-medium text-center">كود المتجر</th>
              <th className="px-4 py-4 text-sm font-medium text-center">شعار المتجر</th>
              <th className="px-4 py-4 text-sm font-medium text-start">اسم المتجر</th>
              <th className="px-4 py-4 text-sm font-medium text-center">نوع المتجر</th>
              <th className="px-4 py-4 text-sm font-medium text-start">الإيميل</th>
              {showRejectedCols ? (
                <>
                  <th className="px-4 py-4 text-sm font-medium text-center">سبب الرفض</th>
                  <th className="px-4 py-4 text-sm font-medium text-center">تاريخ الرفض</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-4 text-sm font-medium text-center">مشاهدات</th>
                  <th className="px-4 py-4 text-sm font-medium text-center">عدد المتابعين</th>
                  <th className="px-4 py-4 text-sm font-medium text-center">للمفضلة</th>
                  <th className="px-4 py-4 text-sm font-medium text-center">الحالة (مفعل - غير مفعل)</th>
                </>
              )}
              <th className="px-4 py-4 text-sm font-medium text-center">عمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.map((store) => {
              const favoritesCell = displayFavorites(store);
              return (
              <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-center">#{store.id}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <div className="relative w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                      {store.logo_url ? (
                        <Image
                          src={store.logo_url}
                          alt={store.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-2">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-start max-w-[200px] truncate">{store.name}</td>
                <td className="px-4 py-4 text-sm text-center">
                  {store.type === "products" ? "منتجات" : "خدمات"}
                </td>
                <td className="px-4 py-4 text-sm text-start text-gray-700 max-w-[180px] truncate">
                  {store.email || store.owner?.email || "—"}
                </td>
                {showRejectedCols ? (
                  <>
                    <td className="px-4 py-4 text-center text-sm text-red-600 max-w-[200px]">
                      {store.reject_reason?.trim() || "—"}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-2">
                      {store.rejected_at ? formatDate(store.rejected_at) : "—"}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-4 text-sm text-center">{displayViews(store)}</td>
                    <td className="px-4 py-4 text-sm text-center">{displayFollowers(store)}</td>
                    <td className="px-4 py-4 text-sm text-center">
                      {favoritesCell != null ? favoritesCell : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          enabled={store.status === "active"}
                          disabled={!canToggleStatus}
                          onChange={() => onToggleStatus(store)}
                        />
                      </div>
                    </td>
                  </>
                )}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onViewDetails(store)}
                      className="w-9 h-9 cursor-pointer flex items-center justify-center rounded-xs bg-blue-5 text-blue-3 hover:bg-blue-100 transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="border-t border-gray-100 p-4 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
