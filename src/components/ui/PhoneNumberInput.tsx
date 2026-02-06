// src/components/ui/PhoneNumberInput.tsx
"use client";

import * as React from "react";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { ChevronDown } from "lucide-react";

interface PhoneNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    required?: boolean;
    countryCode: string;
    onCountryCodeChange: (value: string) => void;
    containerClassName?: string;
    roundedFull?: boolean;
    height?: string;
    rounded?: string;
}

const COUNTRY_RULES: Record<string, { min: number; max: number; name: string }> = {
    "+20": { min: 10, max: 12, name: "مصر" },
    "+966": { min: 9, max: 12, name: "السعودية" },
    "+972": { min: 9, max: 12, name: "فلسطين" },
};

const PhoneNumberInput = React.forwardRef<
    HTMLInputElement,
    PhoneNumberInputProps
>(
    (
        {
            label,
            error,
            required,
            countryCode,
            onCountryCodeChange,
            className,
            containerClassName,
            value,
            onChange,
            roundedFull,
            height,
            rounded,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const dropdownRef = React.useRef<HTMLDivElement>(null);

        // Remove complex internal validation per user request
        const errorMessage = error;

        // Calculate radius classes
        const containerRounded = rounded || (roundedFull ? "rounded-full" : "rounded-lg");
        const leftRounded = rounded ? rounded.replace("rounded", "rounded-l") : (roundedFull ? "rounded-l-full" : "rounded-l-lg");
        const rightRounded = rounded ? rounded.replace("rounded", "rounded-r") : (roundedFull ? "rounded-r-full" : "rounded-r-lg");

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div className={cn("space-y-2", containerClassName)}>
                <label className="block text-sm font-medium text-start">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>

                <div
                    className={cn(
                        "flex items-center w-full border bg-white transition-all",
                        height || "h-10",
                        errorMessage
                            ? "border-red-500 focus-within:ring-1 focus-within:ring-red-200"
                            : "border-gray-200 focus-within:border-[#3A5779] focus-within:border-blue-3 focus-within:ring-1 focus-within:ring-[#3A5779]/20",
                        containerRounded
                    )}
                    dir="ltr"
                >
                    {/* Custom Dropdown */}
                    <div
                        className={cn(
                            "relative h-full border-r border-gray-200 bg-gray-50/50",
                            leftRounded
                        )}
                        ref={dropdownRef}
                    >
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "h-full pl-3 pr-2 flex items-center justify-center gap-2 bg-transparent text-sm focus:outline-none font-sans text-gray-700 min-w-[80px] hover:bg-gray-100 transition-colors cursor-pointer",
                                leftRounded
                            )}
                        >
                            <span dir="ltr" className="font-medium">{countryCode}</span>
                            <ChevronDown
                                className={cn(
                                    "w-3.5 h-3.5 text-gray-400 transition-transform duration-200",
                                    isOpen && "rotate-180"
                                )}
                            />
                        </button>

                        {isOpen && (
                            <div className="absolute top-[calc(100%+4px)] left-0 w-[200px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                {Object.entries(COUNTRY_RULES).map(([code, rule]) => {
                                    const isSelected = countryCode === code;
                                    return (
                                        <button
                                            key={code}
                                            type="button"
                                            onClick={() => {
                                                onCountryCodeChange(code);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer",
                                                isSelected ? "bg-blue-50 text-blue-4" : "text-gray-700"
                                            )}
                                            dir="ltr"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Selection Indicator */}
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                                        isSelected
                                                            ? "border-blue-3 bg-blue-3"
                                                            : "border-gray-300 bg-white"
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span className="font-medium">{code}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{rule.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Input Field */}
                    <Input
                        type="tel"
                        className={cn(
                            "flex-1 h-full border-none shadow-none focus-visible:ring-0 rounded-none font-sans text-left ltr bg-transparent pl-3",
                            rightRounded,
                            className
                        )}
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        placeholder={"0000000000"}
                        {...props}
                    />
                </div>

                {errorMessage && (
                    <p className="text-xs text-red-500 mt-1 font-medium ">{errorMessage}</p>
                )}
            </div>
        );
    }
);
PhoneNumberInput.displayName = "PhoneNumberInput";

export { PhoneNumberInput };