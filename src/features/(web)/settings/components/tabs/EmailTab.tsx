"use client";

import { useState, useEffect } from "react";
import { useGetAccount, useUpdateEmail } from "../../hooks";
import { cn } from "@/src/lib/utils";
import { z } from "zod";

// Validation Schema
const emailSchema = z.object({
    email: z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
});

type FormErrors = Partial<Record<keyof typeof emailSchema.shape, string>>;

export default function EmailTab() {
    const { data: accountData, isLoading: isLoadingAccount } = useGetAccount();
    const { mutate: updateEmail, isPending: isUpdating } = useUpdateEmail();

    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (accountData?.user?.email) {
            setEmail(accountData.user.email);
        }
    }, [accountData]);

    const validateForm = () => {
        const result = emailSchema.safeParse({ email });
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
            updateEmail(email);
        }
    };

    if (isLoadingAccount) {
        return <div className="text-center py-10">جاري التحميل...</div>;
    }

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white ">
            {/* Header Section */}
            <div className="flex flex-col mb-6">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    البريد الإلكتروني
                </h1>
                <p className="text-gray-400 text-sm">
                    تغيير البريد الالكتروني
                </p>
            </div>

            <div className="border-b border-gray-100 mb-8 w-full" />

            <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-[#4B5563] text-right">
                            بريد إلكتروني
                        </label>
                        <div className="flex flex-col gap-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@domain.com"
                                className={cn(
                                    "w-full px-6 py-3.5 border rounded-full focus:outline-none focus:border-gray-400 text-right bg-[#FFFFFF] transition-colors",
                                    errors.email ? "border-red-500" : "border-gray-200"
                                )}
                                dir="ltr"
                            />
                            {/* dir="ltr" is often better for email inputs, but design might request RTL alignment. 
                                The image shows text aligned to the right? Unclear. 
                                Usually emails are LTR. But I'll stick to the input styling I used before which has text-right.
                                Wait, email addresses usually look weird if right aligned. 
                                I'll set text-right as per previous inputs to match design language, 
                                but maybe the user wants it LTR. I'll stick to the "text-right" class as used in other inputs for consistency first.
                            */}
                            {errors.email && <p className="text-red-500 text-xs px-4">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="mt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className={cn(
                                "bg-[#3D5E83] text-white px-16 py-2.5 rounded-full font-medium transition-all shadow-sm active:scale-95 cursor-pointer hover:bg-[#324d6d]",
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
