// src/features/(dashboard)/stores/components/CityMultiSelect.tsx
"use client";

import { useState } from "react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { HelpCircle, X } from "lucide-react";
import { Tooltip } from "@/src/components/ui/Tooltip";

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
  placeholder?: string;
  label?: string;
  tooltip?: string;
  tooltipLabel?: string;
}

export function CityMultiSelect({
  cities,
  selectedCityIds,
  onChange,
  error,
  placeholder = "اختر المدينة",
  label = "المدينة",
  tooltip,
  tooltipLabel = "ما هي مدينة المتجر",
}: CityMultiSelectProps) {
  const [citySearch, setCitySearch] = useState("");

  const dropdownOptions = cities
    .filter((city) => !selectedCityIds.includes(city.id))
    .filter(
      (city) =>
        !citySearch.trim() ||
        city.name.toLowerCase().includes(citySearch.trim().toLowerCase()),
    )
    .map((city) => ({
      value: city.id.toString(),
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
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-start block">
            {label} <span className="text-red-500">*</span>
          </label>
          {tooltip && (
            <Tooltip
              trigger={
                <div className="flex items-center gap-1 text-blue-4 cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{tooltipLabel}</span>
                </div>
              }
              content={tooltip}
            />
          )}
        </div>
        <ReusableDropdown
          options={dropdownOptions}
          value=""
          onChange={handleSelect}
          placeholder={placeholder}
          error={error}
          onSearch={(q) => setCitySearch(q)}
          searchPlaceholder="ابحث عن مدينة..."
        />
      </div>

      {selectedCityIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCityIds.map((id) => {
            const city = cities.find((c) => c.id === id);
            if (!city) return null;

            return (
              <span
                key={id}
                className="inline-flex items-center border border-blue-4 px-2.5 py-1 rounded-full bg-[#F0F8FF] text-blue-4 text-xs font-medium"
              >
                <span className="leading-1">{city.name}</span>
                <span className="w-px h-3.5 bg-[#92AFD0] ms-2 me-1" />
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="flex items-center justify-center text-blue-4 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
