"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useUpdatePassword } from "../../hooks";
import { cn } from "@/src/lib/utils";
import { z } from "zod";

const passwordSchema = z.object({
    old_password: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    password_confirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "كلمات المرور غير متطابقة",
    path: ["password_confirmation"],
});

type PasswordForm = z.infer<typeof passwordSchema>;
type FormErrors = Partial<Record<keyof PasswordForm, string>>;

const EMPTY_FORM: PasswordForm = {
    old_password: "",
    password: "",
    password_confirmation: "",
};

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    autoComplete: string;
}

function PasswordField({ label, value, onChange, error, autoComplete }: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-[#4B5563] text-right">
                {label}
            </label>
            <div className="flex flex-col gap-1">
                <div className="relative">
                    <input
                        type={visible ? "text" : "password"}
                        value={value}
                        autoComplete={autoComplete}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(
                            "w-full px-6 py-3.5 border rounded-full focus:outline-none focus:border-gray-400 text-right bg-[#FFFFFF] transition-colors",
                            error ? "border-red-500" : "border-gray-200"
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setVisible(!visible)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        {visible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-xs px-4">{error}</p>}
            </div>
        </div>
    );
}

export default function PasswordTab() {
    const { mutate: updatePassword, isPending: isUpdating } = useUpdatePassword();

    const [formData, setFormData] = useState<PasswordForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<FormErrors>({});

    const setField = (field: keyof PasswordForm) => (value: string) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

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
                    setFormData(EMPTY_FORM);
                }
            });
        }
    };

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white">
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
                    <PasswordField
                        label="كلمة المرور الحالية"
                        value={formData.old_password}
                        onChange={setField("old_password")}
                        error={errors.old_password}
                        autoComplete="current-password"
                    />

                    <PasswordField
                        label="كلمة المرور الجديدة"
                        value={formData.password}
                        onChange={setField("password")}
                        error={errors.password}
                        autoComplete="new-password"
                    />

                    <PasswordField
                        label="تأكيد كلمة المرور الجديدة"
                        value={formData.password_confirmation}
                        onChange={setField("password_confirmation")}
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                    />

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
