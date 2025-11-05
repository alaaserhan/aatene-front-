// src/features/(dashboard)/cities/components/CitiesPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, HelpCircle, Loader2 } from "lucide-react";
import { CityModal, CityFormData } from "./CityModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ToggleSwitch } from "./ToggleSwitch";
import { City } from "../api";
import {
  useGetCities,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
  useUpdateCityStatus,
} from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";

const ITEMS_PER_PAGE = 6;

export function CitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedCity, setSelectedCity] = useState<CityFormData | null>(null);
  const [cityToDelete, setCityToDelete] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", String(ITEMS_PER_PAGE));
    if (searchQuery) {
      params.set("name", searchQuery);
    }
    return params;
  }, [currentPage, searchQuery]);

  const {
    data: citiesData,
    isLoading,
    isError,
  } = useGetCities(queryParams);

  const { mutate: createCityMutation, isPending: isCreating } = useCreateCity();
  const { mutate: updateCityMutation, isPending: isUpdating } = useUpdateCity();
  const { mutate: deleteCityMutation, isPending: isDeleting } = useDeleteCity();
  const { mutate: updateStatusMutation } = useUpdateCityStatus();

  const cities = citiesData?.data || [];
  const totalPages = Math.ceil(
    (citiesData?.recordsFiltered || 0) / ITEMS_PER_PAGE
  );

  const handleAddCity = () => {
    setSelectedCity(null);
    setModalMode("add");
    setCityModalOpen(true);
  };

  const handleEditCity = (city: City) => {
    setSelectedCity({
      id: city.id,
      name: city.name,
      isActive: city.is_active,
    });
    setModalMode("edit");
    setCityModalOpen(true);
  };

  const handleDeleteClick = (cityId: number) => {
    setCityToDelete(cityId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cityToDelete !== null) {
      deleteCityMutation(cityToDelete, {
        onSuccess: () => {
          if (cities.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        },
      });
    }
  };

  const handleSaveCity = (cityData: CityFormData) => {
    const payload: { name: string; is_active: "0" | "1" } = {
      name: cityData.name,
      is_active: cityData.isActive ? "1" : "0",
    };

    const mutationOptions = {
      onSuccess: () => {
        setCityModalOpen(false);
      },
    };

    if (modalMode === "add") {
      createCityMutation(payload, mutationOptions);
    } else if (selectedCity?.id) {
      updateCityMutation(
        { id: selectedCity.id, payload },
        mutationOptions
      );
    }
  };

  const handleToggleCity = (city: City) => {
    const newStatus = !city.is_active;
    updateStatusMutation({
      id: city.id,
      payload: { is_active: newStatus ? "1" : "0" },
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen my-8">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl sm:text-2xl  font-bold text-brand-black-1">
              المدن المسموح بها للشحن
            </h1>
            <p className="text-sm text-gray-500 mt-1">اختر وجهات الشحن</p>
          </div>

          <button
            onClick={handleAddCity}
            className="flex text-sm items-center gap-2 cursor-pointer px-2 sm:px-6 py-2 sm:py-3 text-white rounded-sm font-medium  transition-colors"
            style={{ backgroundColor: "var(--blue-3)" }}
          >
            <HelpCircle className="sm:w-5 sm:h-5 w-4 h-4" />
            أضف مدينة جديدة
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="ابحث بإسم المدينة"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-sm focus:outline-none focus:border-brand-blue-2 text-right"
                  dir="rtl"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-sm font-medium hover:bg-gray-50 transition-colors"
              >
                بحث
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 py-4 text-start text-sm font-medium text-gray-700 w-5/12 md:w-4/5">
                    اسم المدينة
                  </th>
                  <th className="px-2 py-4 text-start text-sm font-medium text-gray-700 w-3/12 md:w-1/5">
                    حالة التفعيل
                  </th>
                  <th className="px-2 py-4 text-start text-sm font-medium text-gray-700 w-3/12 md:w-1/5">
                    عمليات
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-blue-3" />
                        <span className="text-gray-600">جاري تحميل البيانات...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-red-500">
                      حدث خطأ أثناء جلب البيانات.
                    </td>
                  </tr>
                ) : cities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-gray-500">
                      لا توجد بيانات لعرضها.
                    </td>
                  </tr>
                ) : (
                  cities.map((city) => (
                    <tr
                      key={city.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-4">
                        <span className="text-sm font-medium ">
                          {city.name}
                        </span>
                      </td>

                      <td className="px-2 py-4">
                        <ToggleSwitch
                          enabled={city.is_active}
                          onChange={() => handleToggleCity(city)}
                        />
                      </td>

                      <td className="px-2 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCity(city)}
                            className="p-2.5 bg-[#5B87B91A] cursor-pointer rounded transition-colors group"
                          >
                            <img
                              src="/icons/dashboard/pin.svg"
                              alt="edit"
                              className="w-4 h-4"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(city.id)}
                            className="p-2.5 bg-[#FB37481A] rounded cursor-pointer transition-colors group"
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

          {
            totalPages > 1 && (
              <div className="p-4">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  className={isLoading ? "opacity-50 pointer-events-none" : ""}
                />
              </div>
            )
          }
        </div>
      </div>

      <CityModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        onSave={handleSaveCity}
        city={selectedCity}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}