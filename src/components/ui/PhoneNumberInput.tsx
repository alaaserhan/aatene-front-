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

const COUNTRY_RULES: Record<string, { min: number; max: number; name: string }> = {
    "+20": { min: 10, max: 12, name: "مصر" }, 
    "+966": { min: 9, max: 12, name: "السعودية" },
    "+971": { min: 9, max: 12, name: "الإمارات" },
};

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
            value,
            onChange,
            ...props
        },
        ref
    ) => {
        const currentRule = COUNTRY_RULES[countryCode] || { min: 8, max: 15, name: "" };
        const inputValue = String(value || "");
        const currentLength = inputValue.length;

        // منطق التحقق الجديد
        let customError = null;

        if (currentLength > 0) {
            // 1. التحقق من أن المدخلات أرقام فقط
            // Regex: ^\d+$ تعني أن النص يجب أن يتكون من أرقام فقط من البداية للنهاية
            const isNumeric = /^\d+$/.test(inputValue);

            if (!isNumeric) {
                customError = "يجب إدخال أرقام فقط";
            } else {
                // 2. إذا كانت أرقاماً، نتحقق من الطول
                if (currentLength < currentRule.min) {
                    customError = `رقم الهاتف يجب أن يكون ${currentRule.min} أرقام على الأقل`;
                } else if (currentLength > currentRule.max) {
                    customError = `رقم الهاتف لا يجب أن يتجاوز ${currentRule.max} رقمًا`;
                }
            }
        }

        // الأولوية للخطأ القادم من الخارج (مثل react-hook-form) ثم خطأ التحقق الداخلي
        const errorMessage = error || customError;

        return (
            <div className={cn("space-y-2", containerClassName)}>
                <label className="block text-sm font-medium text-start">
                    {label}
                </label>
                
                <div 
                    className={cn(
                        "flex items-center w-full h-10 border rounded-lg bg-white overflow-hidden transition-all",
                        errorMessage 
                            ? "border-red-500 focus-within:ring-1 focus-within:ring-red-200" 
                            : "border-gray-300 focus-within:border-[#3A5779] focus-within:ring-1 focus-within:ring-[#3A5779]/20"
                    )} 
                    dir="ltr"
                >
                    {/* القائمة */}
                    <div className="relative h-full border-r border-gray-200 bg-gray-50/50">
                        <select
                            value={countryCode}
                            onChange={(e) => onCountryCodeChange(e.target.value)}
                            className="h-full pl-3 pr-8 bg-transparent text-sm appearance-none cursor-pointer focus:outline-none font-sans text-gray-700 min-w-[80px]"
                        >
                            <option value="+20">+20</option>
                            <option value="+966">+966</option>
                            <option value="+971">+971</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                     {/* حقل الإدخال */}
                     <Input
                        // التغيير هنا: جعلناه tel ليقبل الكتابة بحرية ويفتح لوحة الأرقام في الموبايل
                        type="tel" 
                        className={cn(
                            "flex-1 h-full border-none shadow-none focus-visible:ring-0 rounded-none font-sans text-left ltr bg-transparent",
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