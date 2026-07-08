"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/stores/auth-store";
import { sessionQueryKey } from "@/src/auth";
import { useConvertToMerchant } from "../../hooks";
import { cn } from "@/src/lib/utils";

export default function MerchantTab() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const { mutate: convertToMerchant, isPending: isUpdating } = useConvertToMerchant();

    const handleConvert = () => {
        convertToMerchant(undefined, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: sessionQueryKey });
                router.replace("/ar/admin/stores/add");
            },
        });
    };

    if (user?.user_type !== "client") {
        return null; // Should not be reachable if sidebar filtering works
    }

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white ">
            {/* Header Section */}
            <div className="flex flex-col mb-6 text-center md:text-right">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    كن تاجر
                </h1>
                <p className="text-gray-400 text-sm">
                    قم باختيار نوع الحساب الذي تريده (تاجر/مقدم خدمات/صاحب منتجات)
                </p>
            </div>

            <div className="border-b border-gray-100 mb-6 w-full" />

            <div className=" mt-4">
                {/* TODO: use Button component */}
                <button
                    onClick={handleConvert}
                    disabled={isUpdating}
                    className={cn(
                        "bg-primary hover:bg-primary/90 text-white px-20 py-4 rounded-lg font-medium w-full transition-colors shadow-md",
                        isUpdating && "opacity-60 cursor-not-allowed"
                    )}
                >
                    {isUpdating ? "جاري التحويل..." : "انتقل لإنشاء متجرك"}
                </button>
            </div>
        </div>
    );
}
