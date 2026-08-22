"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useUpdatePassword } from "../../hooks";
import { cn } from "@/src/lib/utils";
import { z } from "zod";

// Validation Schema
const passwordSchema = z.object({
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    password_confirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "كلمات المرور غير متطابقة",
    path: ["password_confirmation"],
});

type FormErrors = Partial<Record<keyof typeof passwordSchema.shape, string>>;

export default function PasswordTab() {
    const { mutate: updatePassword, isPending: isUpdating } = useUpdatePassword();

    const [formData, setFormData] = useState({
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = () => {
        const result = passwordSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof FormErrors;
                fieldErrors[path] = issue.message;
            });
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            updatePassword(formData, {
                onSuccess: () => {
                    setFormData({ password: "", password_confirmation: "" });
                }
            });
        }
    };

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white">
            {/* Header Section */}
            <div className="flex flex-col mb-6">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    كلمة المرور
                </h1>
                <p className="text-gray-400 text-sm">
                    تغيير كلمة المرور
                </p>
            </div>

            <div className="border-b border-gray-100 mb-8 w-full" />

            <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col gap-6">
                    {/* New Password */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-[#4B5563] text-right">
                            كلمة المرور
                        </label>
                        <div className="relative flex flex-col items-center gap-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={cn(
                                    "w-full px-6 py-3.5 border rounded-full focus:outline-none focus:border-gray-400 text-right bg-[#FFFFFF] transition-colors",
                                    errors.password ? "border-red-500" : "border-gray-200"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                            {errors.password && <p className="text-red-500 text-xs px-4">{errors.password}</p>}
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-[#4B5563] text-right">
                            تأكيد كلمة المرور
                        </label>
                        <div className="relative flex flex-col gap-1">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                className={cn(
                                    "w-full px-6 py-3.5 border rounded-full focus:outline-none focus:border-gray-400 text-right bg-[#FFFFFF] transition-colors",
                                    errors.password_confirmation ? "border-red-500" : "border-gray-200"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                            {errors.password_confirmation && <p className="text-red-500 text-xs px-4">{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className={cn(
                                "bg-c2-primary hover:bg-c2-navy-600 text-white px-16 py-2.5 rounded-full font-medium transition-all shadow-sm active:scale-95 cursor-pointer",
                                isUpdating && "opacity-60 cursor-not-allowed"
                            )}
                        >
                            {isUpdating ? "جاري الحفظ..." : "حفظ"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
