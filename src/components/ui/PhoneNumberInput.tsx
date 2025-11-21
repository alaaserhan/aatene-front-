// src/components/ui/PhoneNumberInput.tsx
"use client";

import * as React from "react";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { ChevronDown } from "lucide-react";

interface PhoneNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    countryCode: string;
    onCountryCodeChange: (value: string) => void;
    containerClassName?: string;
}

const PhoneNumberInput = React.forwardRef<
    HTMLInputElement,
    PhoneNumberInputProps
>(
    (
        {
            label,
            error,
            countryCode,
            onCountryCodeChange,
            className,
            containerClassName,
            ...props
        },
        ref
    ) => {
        return (
            <div className={cn("space-y-3", containerClassName)}>
                <label className="block text-sm font-medium mb-2">
                    {label}
                </label>
                <div className="flex gap-2">
                    <Input
                        type="tel"
                        className={cn("flex-1", className)}
                        ref={ref}
                        {...props}
                    />
                    <div className="relative w-24">
                        <select
                            value={countryCode}
                            onChange={(e) => onCountryCodeChange(e.target.value)}
                            className={cn("w-full h-9 px-3 ps-8 bg-white border border-gray-300 rounded-sm text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-[#3A5779] focus:border-transparent", className)}
                        >
                            <option value="+20">+20</option>
                            <option value="+966">+966</option>
                            <option value="+971">+971</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
                {error && (
                    <p className="text-xs text-red-500 mt-1 ">{error}</p>
                )}
            </div>
        );
    }
);
PhoneNumberInput.displayName = "PhoneNumberInput";

export { PhoneNumberInput };