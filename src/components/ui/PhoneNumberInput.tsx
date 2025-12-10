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

// إعدادات القواعد لكل دولة
const COUNTRY_RULES: Record<string, { min: number; max: number; name: string }> = {
    "+20": { 
        min: 10, // 1280626320 (بدون 0)
        max: 12, // 201280626320 (مع كود الدولة)
        name: "مصر" 
    }, 
    "+966": { 
        min: 9,  // 5xxxxxxxx (بدون 0)
        max: 12, // 9665xxxxxxxx (مع كود الدولة)
        name: "السعودية" 
    },
    "+971": { 
        min: 9,  // 5xxxxxxxx (بدون 0)
        max: 12, // 9715xxxxxxxx (مع كود الدولة)
        name: "الإمارات" 
    },
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
        // جلب القواعد الخاصة بالدولة المختارة، أو استخدام قيم افتراضية
        const currentRule = COUNTRY_RULES[countryCode] || { min: 8, max: 12, name: "" };
        
        const inputValue = String(value || "");
        const currentLength = inputValue.length;

        // التحقق من الطول
        let lengthError = null;
        if (currentLength > 0) {
            if (currentLength < currentRule.min) {
                lengthError = `رقم الهاتف يجب أن يكون ${currentRule.min} أرقام على الأقل`;
            } else if (currentLength > currentRule.max) {
                lengthError = `رقم الهاتف لا يجب أن يتجاوز ${currentRule.max} رقمًا`;
            }
        }

        // دمج الخطأ القادم من الخارج مع خطأ التحقق الداخلي
        const errorMessage = error || lengthError;

        return (
            <div className={cn("space-y-3", containerClassName)}>
                <label className="block text-sm font-medium mb-2">
                    {label}
                </label>
                <div className="flex gap-2" dir="ltr"> {/* dir="ltr" لضمان ترتيب الإدخال الصحيح للأرقام */}
                   
                    {/* قائمة الدول */}
                    <div className="relative w-24 shrink-0">
                        <select
                            value={countryCode}
                            onChange={(e) => onCountryCodeChange(e.target.value)}
                            className={cn(
                                "w-full h-10 px-3 pl-3 pr-8 bg-gray-50 border border-gray-300 rounded-md text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-[#3A5779] focus:border-transparent outline-none transition-all font-sans",
                                className
                            )}
                        >
                            <option value="+20">+20</option>
                            <option value="+966">+966</option>
                            <option value="+971">+971</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                     {/* حقل الإدخال */}
                     <Input
                        type="number"
                        className={cn(
                            "flex-1 h-10 font-sans text-left ltr", // text-left لظهور الأرقام بشكل صحيح
                            errorMessage ? "border-red-500 focus-visible:ring-red-200" : "",
                            className
                        )}
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        placeholder={countryCode === "+20" ? "01xxxxxxxxx" : "5xxxxxxxx"}
                        // لا نضع maxLength هنا كـ attribute لنسمح للمستخدم بالكتابة ونظهر له الخطأ، 
                        // لكن يمكن إضافته إذا أردت منعه من الكتابة تماماً بعد الحد الأقصى
                        // maxLength={currentRule.max} 
                        {...props}
                    />
                </div>
                {errorMessage && (
                    <p className="text-xs text-red-500 mt-1 font-medium text-right">{errorMessage}</p>
                )}
            </div>
        );
    }
);
PhoneNumberInput.displayName = "PhoneNumberInput";

export { PhoneNumberInput };