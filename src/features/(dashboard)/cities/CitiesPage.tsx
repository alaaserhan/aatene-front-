"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, HelpCircle } from "lucide-react";
import { CityModal, City } from "./CityModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { SuccessModal } from "./SuccessModal";
import { ToggleSwitch } from "./ToggleSwitch";

export function CitiesPage() {
  // Mock data - replace with real API data
  const [cities, setCities] = useState<City[]>([
    {
      id: 1,
      name: "الناصرة",
      neighborhoods: ["حي الصافرة", "الحارة الشرقية", "حارة الصير", "الكروم"],
      isActive: true,
    },
    {
      id: 2,
      name: "رفح الله",
      neighborhoods: [],
      isActive: false,
    },
    {
      id: 3,
      name: "الناصرة",
      neighborhoods: [],
      isActive: true,
    },
    {
      id: 4,
      name: "الناصرة",
      neighborhoods: [],
      isActive: true,
    },
    {
      id: 5,
      name: "بيت حنينا",
      neighborhoods: [],
      isActive: false,
    },
    {
      id: 6,
      name: "بيت حنينا",
      neighborhoods: [],
      isActive: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [successMessage, setSuccessMessage] = useState("تم حذف المدينة");

  const itemsPerPage = 6;

  // Filter cities by search query
  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCities = filteredCities.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers
  const handleAddCity = () => {
    setSelectedCity(null);
    setModalMode("add");
    setCityModalOpen(true);
  };

  const handleEditCity = (city: City) => {
    setSelectedCity(city);
    setModalMode("edit");
    setCityModalOpen(true);
  };

  const handleDeleteClick = (cityId: number) => {
    setCityToDelete(cityId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cityToDelete !== null) {
      setCities(cities.filter((city) => city.id !== cityToDelete));
      setCityToDelete(null);
      setSuccessMessage("تم حذف المدينة");
      setSuccessModalOpen(true);
    }
  };

  const handleSaveCity = (cityData: City) => {
    if (modalMode === "add") {
      const newCity = {
        ...cityData,
        id: Math.max(...cities.map((c) => c.id || 0), 0) + 1,
      };
      setCities([...cities, newCity]);
      setSuccessMessage("تم إضافة المدينة بنجاح");
    } else {
      setCities(
        cities.map((city) =>
          city.id === selectedCity?.id ? { ...cityData, id: city.id } : city
        )
      );
      setSuccessMessage("تم تعديل المدينة بنجاح");
    }
    setSuccessModalOpen(true);
  };

  const handleToggleCity = (cityId: number) => {
    setCities(
      cities.map((city) =>
        city.id === cityId ? { ...city, isActive: !city.isActive } : city
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-black-1">
              المدن المسموح بها للشحن
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              اختر مدينتك ووجهات الشحن
            </p>
          </div>

          <button
            onClick={handleAddCity}
            className="flex items-center gap-2 px-6 py-3 bg-brand-blue-3 text-white rounded-lg font-medium hover:bg-brand-blue-2 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            أضف مدينة جديدة
          </button>
        </div>

        {/* Search and Table Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                بحث
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ابحث بإسم المدينة"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right"
                  dir="rtl"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    عمليات
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    حالة التفعيل
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    اسم المدينة
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCities.map((city) => (
                  <tr
                    key={city.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteClick(city.id!)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-600" />
                        </button>
                        <button
                          onClick={() => handleEditCity(city)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                          <Pencil className="w-5 h-5 text-gray-600 group-hover:text-gray-700" />
                        </button>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <ToggleSwitch
                        enabled={city.isActive}
                        onChange={() => handleToggleCity(city.id!)}
                      />
                    </td>

                    {/* City Name */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-brand-black-1">
                        {city.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-center items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full font-medium transition-colors ${
                        currentPage === page
                          ? "bg-brand-blue-3 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                {totalPages > 4 && (
                  <span className="text-gray-500 px-2">····</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title={successMessage}
      />
    </div>
  );
}