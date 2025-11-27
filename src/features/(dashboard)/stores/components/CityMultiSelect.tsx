// src/features/(dashboard)/stores/components/CityMultiSelect.tsx
"use client";

import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Trash2 } from "lucide-react";

// تعريف المدينة بـ ID رقمي
interface CityOption {
  id: number;
  name: string;
}

interface CityMultiSelectProps {
  cities: CityOption[]; // قائمة المدن بالكامل
  selectedCityIds: number[]; // مصفوفة أرقام
  onChange: (ids: number[]) => void;
  error?: string;
}

export function CityMultiSelect({
  cities,
  selectedCityIds,
  onChange,
  error,
}: CityMultiSelectProps) {

  
        console.log(selectedCityIds)
        console.log(cities);
        
  // تحويل البيانات لكي تناسب ReusableDropdown
  // نستبعد المدن المختارة بالفعل
  const dropdownOptions = cities
    .filter((city) => !selectedCityIds.includes(city.id))
    .map((city) => ({
      value: city.id.toString(), // نحول الرقم لنص للـ Dropdown
      label: city.name,
    }));

  const handleSelect = (cityIdString: string) => {
    // عند الاختيار نحول النص لرقم مرة أخرى
    const cityId = parseInt(cityIdString, 10);
    if (!isNaN(cityId)) {
        onChange([...selectedCityIds, cityId]);
    }
  };

  const handleRemove = (cityId: number) => {
    onChange(selectedCityIds.filter((id) => id !== cityId));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-start block">
          المدينة
        </label>
        <ReusableDropdown
          options={dropdownOptions}
          value="" // دائماً فارغ لإظهار الـ Placeholder
          onChange={handleSelect}
          placeholder="اختر المدينة"
          error={error}
        />
      </div>

      {selectedCityIds.length > 0 && (
        <div className=" overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#F0F8FF] border-b border-gray-100">
            <span className="text-sm font-medium text-blue-4">المدينة</span>
            <span className="text-sm font-medium text-blue-4">الاجراءات</span>
          </div>

          {/* Rows */}
          <div className="bg-white">
            {selectedCityIds.map((id) => {
              const city = cities.find((c) => c.id === id);
              if (!city) return null;

              return (
                <div
                  key={id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm font-medium text-blue-3">
                    {city.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[#FFF5F5] text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                   <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}