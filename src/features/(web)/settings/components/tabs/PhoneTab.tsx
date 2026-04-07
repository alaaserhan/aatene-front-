"use client";

import { useState, useEffect } from "react";
import { useGetAccount, useUpdatePhone } from "../../hooks";
import { cn } from "@/src/lib/utils";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";

export default function PhoneTab() {
    const { data: accountData, isLoading: isLoadingAccount } = useGetAccount();
    const { mutate: updatePhone, isPending: isUpdating } = useUpdatePhone();

    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+972");
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (accountData?.user?.phone) {
            const rawPhone = accountData.user.phone;
            // Strip the country code prefix if it's already included
            const knownCodes = ["+972", "+20", "+966", "+1"];
            let stripped = rawPhone;
            for (const code of knownCodes) {
                if (rawPhone.startsWith(code)) {
                    setCountryCode(code);
                    stripped = rawPhone.slice(code.length);
                    break;
                }
            }
            setPhone(stripped);
        }
    }, [accountData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone) {
            setError("رقم الهاتف مطلوب");
            return;
        }

        // The PhoneNumberInput might handle internal validation, 
        // but we can add a check here too if needed.
        updatePhone(`${countryCode}${phone}`);
    };

    if (isLoadingAccount) {
        return <div className="text-center py-10">جاري التحميل...</div>;
    }

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white">
            {/* Header Section */}
            <div className="flex flex-col mb-6">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    رقم الهاتف
                </h1>
                <p className="text-gray-400 text-sm">
                    تغير رقم الهاتف
                </p>
            </div>

            <div className="border-b border-gray-100 mb-8 w-full" />

            <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <PhoneNumberInput
                            label="رقم الهاتف"
                            countryCode={countryCode}
                            onCountryCodeChange={setCountryCode}
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                if (error) setError(undefined);
                            }}
                            error={error}
                            placeholder="00000000"
                            height="h-[54px]"
                            rounded="rounded-full"
                            containerClassName="max-w-full"
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
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
