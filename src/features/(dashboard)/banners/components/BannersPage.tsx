// src/features/(dashboard)/banners/components/BannersPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, HelpCircle, Loader2, Eye, Pencil, Circle, Plus } from "lucide-react";
import { Banner } from "../api";
import { formatDate } from "@/src/lib/date-helper";
import { isVideoFile } from "@/src/lib/utils";
import {
  useGetBanners,
  useDeleteBanner,
  useUpdateBannerStatus,
} from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { useRouter } from "next/navigation";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Input } from "@/src/components/ui/input";

const ITEMS_PER_PAGE = 7;

type FilterStatus = "all" | "active" | "inactive";

const filterOptions = [
  { value: "all", label: "الكل" },
  { value: "active", label: "فعال فقط" },
  { value: "inactive", label: "غير فعال فقط" },
];

const sortOptions = [
  { value: "priority", label: "الأولوية" },
  { value: "start_date", label: "تاريخ البدء" },
  { value: "end_date", label: "تاريخ الانتهاء" },
];

export function BannersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState("created_at");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", String(ITEMS_PER_PAGE));

    if (searchQuery) {
      params.set("title", searchQuery);
    }

    if (filterStatus === "active") {
      params.set("is_active", "true");
    } else if (filterStatus === "inactive") {
      params.set("is_active", "false");
    }

    params.set("orderBy", sortBy);

    return params;
  }, [currentPage, searchQuery, filterStatus, sortBy]);

  const {
    data: bannersData,
    isLoading,
    isError,
  } = useGetBanners(queryParams);

  const { mutate: deleteBannerMutation, isPending: isDeleting } =
    useDeleteBanner();
  const { mutate: updateStatusMutation } = useUpdateBannerStatus();

  const banners = bannersData?.data || [];
  const totalPages = Math.ceil(
    (bannersData?.recordsFiltered || 0) / ITEMS_PER_PAGE
  );

  const handleAddBanner = () => {
    router.push("/admin/banners/add");
  };

  const handleViewBanner = (bannerId: number) => {
    router.push(`/admin/banners/${bannerId}`);
  };

  const handleEditBanner = (bannerId: number) => {
    router.push(`/admin/banners/${bannerId}/edit`);
  };

  const handleDeleteClick = (bannerId: number) => {
    setBannerToDelete(bannerId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bannerToDelete !== null) {
      deleteBannerMutation(bannerToDelete, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSuccessModalOpen(true);
          if (banners.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        },
      });
    }
  };

  const handleToggleBanner = (banner: Banner) => {
    const currentStatus = banner.is_active === "1" || banner.is_active === true;
    const newStatus = !currentStatus;
    updateStatusMutation({
      id: banner.id,
      payload: { is_active: newStatus ? "1" : "0" },
    });
  };

    return (
        <div className="min-h-screen my-4 md:my-8">
            <div className="container mx-auto py-4 md:py-8 px-3 md:px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <h1 className="text-xl md:text-2xl font-bold text-brand-black-1">
                            بنرات إعلانية
                        </h1>
                        <p className="text-sm text-gray-2 mt-1">
                            تميز لك رفع بنرات جديدة مع تحديد العنوان والرابط وترتيب العرض
                            بالإضافة الى إدارة البنرات الحالية خلال تعديلها أو حذفها
                        </p>
                    </div>

                    <button
                        onClick={handleAddBanner}
                        className="flex w-full sm:w-auto text-sm items-center justify-center gap-2 cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 active:scale-[0.98] whitespace-nowrap"
                        style={{ backgroundColor: "var(--blue-3)" }}
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        أضف بنر إعلاني
                    </button>
                </div>



        <div className="bg-white rounded-lg border border-gray-200  overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col lg:flex-row sm:justify-between gap-3">
            <div>
              <p className="text-xl font-bold">
                جميع البنرات ({bannersData?.recordsFiltered || 0})
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative bg-white rounded-lg border border-gray-200 w-full sm:min-w-[220px] sm:max-w-[280px]">
                <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="ابحث بعنوان البنر..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pr-10 h-11 border-none shadow-none focus-visible:ring-0 text-right"
                />
              </div>
              <ReusableDropdown
                placeholder="حالة الإعلان"
                options={filterOptions}
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value as FilterStatus);
                  setCurrentPage(1);
                }}
                className="w-full sm:min-w-[140px]"
              />
              <ReusableDropdown
                placeholder="ترتيب حسب..."
                options={sortOptions}
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
                className="w-full sm:min-w-[140px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-4 py-4 text-start text-xs sm:text-sm font-medium text-gray-1">#</th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 py-4 text-center text-xs sm:text-sm font-medium text-gray-1 w-48">
                    صورة الإعلان
                  </th>
                  <th className="px-3 sm:px-4 py-4 text-start text-xs sm:text-sm font-medium text-gray-1">
                    المكان
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-4 py-4 text-start text-xs sm:text-sm font-medium text-gray-1">
                    الرابط
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-4 py-4 text-start text-xs sm:text-sm font-medium text-gray-1">
                    تاريخ البدء والانتهاء
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 py-4 text-start text-xs sm:text-sm font-medium text-gray-1">
                    الترتيب
                  </th>
                  <th className="px-3 sm:px-4 py-4 text-start text-xs sm:text-sm font-medium text-gray-1">
                    فعال
                  </th>
                  <th className="px-3 sm:px-4 py-4 text-start text-xs sm:text-sm font-medium text-gray-1 min-w-32 sm:min-w-40">
                    عمليات
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-blue-3" />
                        <span className="text-gray-2">
                          جاري تحميل البيانات...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-red-500">
                      حدث خطأ أثناء جلب البيانات.
                    </td>
                  </tr>
                ) : banners.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-gray-2">
                      لا توجد بيانات لعرضها.
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr
                      key={banner.id}
                      className="border-b border-gray-200  last:border-0 "
                    >
                      <td className="px-3 sm:px-4 py-4">
                        <span className="text-xs sm:text-sm font-medium">
                          #{banner.id}
                        </span>
                      </td>

                      <td className="hidden sm:table-cell px-3 sm:px-4 py-4 text-center">
                        <div className="flex justify-center">
                          {isVideoFile(banner.labtop_banner_url || "") ? (
                            <video
                              src={banner.labtop_banner_url}
                              className="max-h-16 sm:max-h-24 max-w-28 sm:max-w-44 object-cover rounded pointer-events-none"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img
                              src={banner.labtop_banner_url}
                              alt={banner.title}
                              className="max-h-16 sm:max-h-24 max-w-28 sm:max-w-44 object-cover rounded"
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-3 sm:px-4 py-4">
                        <span className="text-xs sm:text-sm">
                          {banner.place}
                        </span>
                      </td>

                      <td className="hidden md:table-cell px-3 sm:px-4 py-4">
                        <a
                          href={banner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm hover:underline truncate block max-w-[120px] sm:max-w-xs"
                          title={banner.url}
                        >
                          {banner.url}
                        </a>
                      </td>


                      <td className="hidden lg:table-cell px-3 sm:px-4 py-4">
                        <div className="text-xs sm:text-sm">
                          <div className="whitespace-nowrap">
                            {formatDate(banner.start_date)} - {formatDate(banner.end_date)}
                          </div>
                        </div>
                      </td>


                      <td className="hidden sm:table-cell px-3 sm:px-4 py-4">
                        <span className="text-xs sm:text-sm text-center block">
                          {banner.priority}
                        </span>
                      </td>

                      <td className="px-3 sm:px-4 py-4">
                        <ToggleSwitch
                          enabled={
                            banner.is_active === "1" ||
                            banner.is_active === true
                          }
                          onChange={() => handleToggleBanner(banner)}
                        />
                      </td>

                      <td className="px-3 sm:px-4 py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleViewBanner(banner.id)}
                            className="p-2.5 bg-blue-5 cursor-pointer rounded transition-colors group"
                            title="عرض"
                          >
                            <Eye className="w-4 h-4 text-blue-3" />
                          </button>

                          <button
                            onClick={() => handleEditBanner(banner.id)}
                            className="p-2.5 bg-blue-5 cursor-pointer rounded transition-colors group"
                            title="تعديل"
                          >
                            <Pencil className="w-4 h-4 text-blue-3" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(banner.id)}
                            className="p-2.5 bg-[#FB37481A] rounded cursor-pointer transition-colors group"
                            title="حذف"
                          >
                            <img
                              src="/icons/dashboard/trash.svg"
                              alt="Delete"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
                className={isLoading ? "opacity-50 pointer-events-none" : ""}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من حذف البنر؟"
        description="لا يمكن استرجاع البنر بعد حذفه"
        confirmText="نعم، قم بالحذف"
        cancelText="إلغاء"
      />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="تم حذف البانر بنجاح"
        message="تم حذف البانر الإعلاني بنجاح"
      />
    </div>
  );
}