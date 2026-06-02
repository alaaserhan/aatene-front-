"use client";

import Image from "next/image";
import { Eye, Loader2 } from "lucide-react";
import { Store, StoreStatus } from "../api";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { Pagination } from "@/src/components/ui/Pagination";
import { formatDate } from "@/src/lib/date-helper";

function coerceToCount(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function coerceToOptionalCount(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function displayViews(store: Store): number {
  return coerceToCount(store.view_count ?? store.views_count);
}

function displayFollowers(store: Store): number {
  return coerceToCount(store.followers_count);
}

function displayFavorites(store: Store): number | null {
  return coerceToOptionalCount(
    store.favorites_count ?? store.favorite_count ?? store.favourites_count
  );
}

interface StoresAdminTableProps {
  stores: Store[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  listStatus: StoreStatus;
  onToggleShown: (store: Store) => void;
  onViewDetails: (store: Store) => void;
  canToggleStoreShown?: boolean;
}

export function StoresAdminTable({
  stores,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  listStatus,
  onToggleShown,
  onViewDetails,
  canToggleStoreShown = false,
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
  const canToggleShown = listStatus !== "rejected" && canToggleStoreShown;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#EEF2F6] border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">#</th>
              <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">الشعار</th>
              <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-start whitespace-nowrap">اسم المتجر</th>
              <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">النوع</th>
              <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-start whitespace-nowrap">الإيميل</th>
              {showRejectedCols ? (
                <>
                  <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">سبب الرفض</th>
                  <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">تاريخ الرفض</th>
                </>
              ) : (
                <>
                  <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">مشاهدات</th>
                  <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">متابعين</th>
                  <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">مفضلة</th>
                  <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">الظهور</th>
                </>
              )}
              <th className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">عمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.map((store) => {
              const favoritesCell = displayFavorites(store);
              return (
              <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium text-center whitespace-nowrap">#{store.id}</td>
                <td className="px-3 sm:px-4 py-4">
                  <div className="flex justify-center">
                    <div className="relative w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
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
                <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium max-w-[120px] sm:max-w-[200px] truncate">{store.name}</td>
                <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-center whitespace-nowrap">
                  {store.type === "products" ? "منتجات" : "خدمات"}
                </td>
                <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-[180px] truncate">
                  {store.email || store.owner?.email || "—"}
                </td>
                {showRejectedCols ? (
                  <>
                    <td className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm text-red-600 max-w-[120px] sm:max-w-[200px] truncate">
                      {store.reject_reason?.trim() || "—"}
                    </td>
                    <td className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm text-gray-2 whitespace-nowrap">
                      {store.rejected_at ? formatDate(store.rejected_at) : "—"}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-center whitespace-nowrap">{displayViews(store)}</td>
                    <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-center whitespace-nowrap">{displayFollowers(store)}</td>
                    <td className="px-3 sm:px-4 py-4 text-xs sm:text-sm text-center whitespace-nowrap">
                      {favoritesCell != null ? favoritesCell : "—"}
                    </td>
                    <td className="px-3 sm:px-4 py-4">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          enabled={store.shown !== false}
                          disabled={!canToggleShown}
                          onChange={() => onToggleShown(store)}
                        />
                      </div>
                    </td>
                  </>
                )}
                <td className="px-3 sm:px-4 py-4">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onViewDetails(store)}
                      className="w-8 h-8 sm:w-9 sm:h-9 cursor-pointer flex items-center justify-center rounded-xs bg-blue-5 text-blue-3 hover:bg-blue-100 transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
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
