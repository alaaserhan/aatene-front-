// src/features/(dashboard)/banners/components/BannersPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, HelpCircle, Loader2, Eye, Pencil, Circle } from "lucide-react";
import { Banner } from "../api";
import {
  useGetBanners,
  useDeleteBanner,
  useUpdateBannerStatus,
} from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { useRouter } from "next/navigation";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

const ITEMS_PER_PAGE = 7;

type FilterStatus = "all" | "active" | "inactive";

const filterOptions = [
  { value: "all", label: "الكل" },
  { value: "active", label: "فعال فقط" },
  { value: "inactive", label: "غير فعال فقط" },
];

const sortOptions = [
  { value: "created_at", label: "ترتيب حسب..." },
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
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", String(ITEMS_PER_PAGE));

    if (searchQuery) {
      params.set("search", searchQuery);
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

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen my-8">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-brand-black-1">
              بنرات إعلانية
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              تميز لك رفع بنرات جديدة مع تحديد العنوان والرابط وترتيب العرض
              بالإضافة الى إدارة البنرات الحالية خلال تعديلها أو حذفها
            </p>
          </div>

          <button
            onClick={handleAddBanner}
            className="flex w-full sm:w-auto text-sm items-center gap-2 cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-sm font-medium transition-colors whitespace-nowrap"
            style={{ backgroundColor: "var(--blue-3)" }}
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            أضف بنر إعلاني
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col lg:flex-row sm:justify-between gap-3">
            <div>
              <p className="text-xl font-bold">
                جميع البنرات ({bannersData?.recordsFiltered || 0})
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex ">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="البحث"
                    className="w-full px-4 py-2 ps-12 border border-gray-300 rounded-s-sm focus:outline-none  text-start"
                  />
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 cursor-pointer text-white border-none rounded-e-sm font-medium transition-colors flex items-center justify-center"
                  style={{ backgroundColor: "var(--blue-3)" }}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <ReusableDropdown
                triggerIcon={
                  <Circle className="w-4 h-4 text-blue-3 flex-shrink-0" />
                }
                placeholder="حالة الإعلان"
                options={filterOptions}
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value as FilterStatus);
                  setCurrentPage(1);
                }}
              />
              <ReusableDropdown
                placeholder="ترتيب حسب..."
                options={sortOptions}
                value={sortBy}
                showSelectedLabel={true}
                onChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700 ">
                    رقم الإعلان
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700 w-48">
                    صورة الإعلان
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700">
                    مكان العرض
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700">
                    الرابط
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700 ">
                    تاريخ البدء والانتهاء
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700 ">
                    تاريخ الانشاء
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700">
                    ترتيب العرض
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700 ">
                    فعال
                  </th>
                  <th className="px-4 py-4 text-start text-sm font-medium text-gray-700 min-w-40">
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
                        <span className="text-gray-600">
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
                    <td colSpan={9} className="text-center p-8 text-gray-500">
                      لا توجد بيانات لعرضها.
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr
                      key={banner.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          #{banner.id}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <img
                          src={banner.labtop_banner_url}
                          alt={banner.title}
                          className="max-h-24 max-w-44 object-cover rounded"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm">
                          {banner.place}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <a
                          href={banner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline truncate block max-w-xs"
                          title={banner.url}
                        >
                          {banner.url}
                        </a>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm ">
                          <div className="whitespace-nowrap">
                            {banner.start_date} / {banner.end_date}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm  whitespace-nowrap">
                          {banner.start_date}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm   text-center block">
                          {banner.priority}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <ToggleSwitch
                          enabled={
                            banner.is_active === "1" ||
                            banner.is_active === true
                          }
                          onChange={() => handleToggleBanner(banner)}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
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
    </div>
  );
}