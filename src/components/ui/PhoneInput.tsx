// src/components/ui/PhoneInput.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

// Country data with flags
interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const allCountries: Country[] = [
  { name: "مصر", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "فلسطين", code: "PS", dialCode: "+970", flag: "🇵🇸" },
  { name: "السعودية", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "الإمارات", code: "AE", dialCode: "+972", flag: "🇦🇪" },
  { name: "الكويت", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "البحرين", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "قطر", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "عمان", code: "OM", dialCode: "+968", flag: "🇴🇲" },
  { name: "الأردن", code: "JO", dialCode: "+962", flag: "🇯🇴" },
  { name: "لبنان", code: "LB", dialCode: "+961", flag: "🇱🇧" },
  { name: "سوريا", code: "SY", dialCode: "+963", flag: "🇸🇾" },
  { name: "العراق", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
  { name: "اليمن", code: "YE", dialCode: "+967", flag: "🇾🇪" },
  { name: "ليبيا", code: "LY", dialCode: "+218", flag: "🇱🇾" },
  { name: "تونس", code: "TN", dialCode: "+216", flag: "🇹🇳" },
  { name: "الجزائر", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
  { name: "المغرب", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "السودان", code: "SD", dialCode: "+249", flag: "🇸🇩" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryChange?: (countryCode: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  countries?: string[]; // Array of country codes to show (e.g., ["EG", "PS"])
}

export function PhoneInput({
  value,
  onChange,
  countryCode: controlledCountryCode,
  onCountryChange,
  placeholder = "1289022985",
  className,
  disabled = false,
  error = false,
  countries,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalCountryCode, setInternalCountryCode] = React.useState("+20");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Determine if controlled or uncontrolled
  const isControlled = controlledCountryCode !== undefined;
  const currentCountryCode = isControlled
    ? controlledCountryCode
    : internalCountryCode;

  // Filter countries based on allowed countries prop
  const filteredCountries = React.useMemo(() => {
    if (!countries || countries.length === 0) {
      return allCountries;
    }
    return allCountries.filter((country) => countries.includes(country.code));
  }, [countries]);

  // Default to Egypt and Palestine if countries prop is provided
  React.useEffect(() => {
    if (countries && countries.length > 0 && !isControlled) {
      const defaultCountry = filteredCountries.find((c) => c.code === "EG");
      if (defaultCountry) {
        setInternalCountryCode(defaultCountry.dialCode);
      }
    }
  }, [countries, filteredCountries, isControlled]);

  const selectedCountry = filteredCountries.find(
    (c) => c.dialCode === currentCountryCode
  );

  const handleCountrySelect = (country: Country) => {
    if (isControlled) {
      onCountryChange?.(country.dialCode);
    } else {
      setInternalCountryCode(country.dialCode);
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Country Code Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 h-10 px-3 bg-white border rounded-lg text-sm transition-colors",
            "focus:ring-2 focus:ring-[#3A5779] focus:border-transparent",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500",
            !error && "border-gray-300"
          )}
        >
          <span className="text-lg">{selectedCountry?.flag || "🌍"}</span>
          <span className="font-medium whitespace-nowrap">
            {selectedCountry?.dialCode || "+20"}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-right",
                  country.dialCode === currentCountryCode && "bg-blue-50"
                )}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 font-medium">{country.name}</span>
                <span className="text-gray-500">{country.dialCode}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 h-10 px-3 bg-white border rounded-lg text-sm",
          "focus:ring-2 focus:ring-[#3A5779] focus:border-transparent",
          "placeholder:text-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500",
          !error && "border-gray-300"
        )}
      />
    </div>
  );
}