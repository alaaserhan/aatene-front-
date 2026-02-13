// src/features/(web)/product/components/StoreInfoBar.tsx
"use client";

import { useState } from "react";
import { Store } from "../api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ProviderInfoCard, ProviderData } from "@/src/components/(dashboard)/ProviderInfoCard";
import { ReportAbuseModal } from "@/src/features/(web)/reports/components/ReportAbuseModal";

interface StoreInfoBarProps {
    store: Store;
}

export default function StoreInfoBar({ store }: StoreInfoBarProps) {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const providerData: ProviderData = {
        name: store.name,
        avatar: store.logo,
        location: store.address || "فلسطين",
        memberSince: store.created_at
            ? format(new Date(store.created_at), "dd-MM-yyyy", { locale: ar })
            : "",
        rating: store.review_rate || "0",
        ordersCount: store.view_count || 0,
        isVerified: true // You might want to base this on store.status or similar
    };

    return (
        <div className="mt-10 border-t border-gray-200 pt-6">
            <ProviderInfoCard
                provider={providerData}
                onReport={() => setIsReportModalOpen(true)}
                className="border-0 p-0 shadow-none bg-transparent"
            />

            <ReportAbuseModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                type="store"
                id={store.id}
            />
        </div>
    );
}
