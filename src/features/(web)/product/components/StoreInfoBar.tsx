"use client";

import { useState, useEffect } from "react";
import { Store } from "../api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ProviderInfoCard, ProviderData } from "@/src/components/(dashboard)/ProviderInfoCard";
import { ReportAbuseModal } from "@/src/features/(web)/reports/components/ReportAbuseModal";
import { useFollowUserOrStore, useUnfollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { toast } from "sonner";
import { useAuthStore } from "@/src/stores/auth-store";

interface StoreInfoBarProps {
    store: Store;
}

export default function StoreInfoBar({ store }: StoreInfoBarProps) {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(store.am_i_following || false);
    const { user } = useAuthStore();

    useEffect(() => {
        setIsFollowing(store.am_i_following || false);
    }, [store.am_i_following]);

    const { mutate: follow, isPending: isFollowPending } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollowUserOrStore();

    const isLoading = isFollowPending || isUnfollowPending;

    const handleFollowToggle = () => {
        if (!user) {
            toast.error("يجب عليك تسجيل الدخول أولاً");
            return;
        }

        if (isFollowing) {
            unfollow({
                followed_id: store.id,
                followed_type: "store"
            } as any, {
                onSuccess: () => setIsFollowing(false)
            });
        } else {
            follow({
                followed_id: store.id,
                followed_type: "store"
            }, {
                onSuccess: () => setIsFollowing(true)
            });
        }
    };

    const providerData: ProviderData = {
        name: store.name,
        avatar: store.logo_url || "",
        location: store.city?.name || "فلسطين",
        memberSince: store.created_at
            ? format(new Date(store.created_at), "dd-MM-yyyy", { locale: ar })
            : "",
        rating: store.review_rate || "0",
        ordersCount: store.view_count || 0,
        isVerified: true,
        slug:store.slug
    };

    return (
        <div className="mt-10 border border-gray-200 rounded-lg p-4">
            <ProviderInfoCard
                provider={providerData}
                onReport={() => setIsReportModalOpen(true)}
                onFollow={handleFollowToggle}
                isFollowing={isFollowing}
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
