//src/features/(dashboard)/followings/components/FollowingsPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/src/components/ui/input";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useGetMyFollowers, useGetMyFollowings, useFollowUser, useUnfollowUser } from "../hooks";
import { FollowersTable } from "./FollowersTable";
import { FollowersEmptyState } from "./FollowersEmptyState";
import { FollowEntity } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";
import Cookies from "js-cookie";

type TabType = "followers" | "followings";

export function FollowingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("followers"); // "followers" = يتابعك (Default)
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [actionTargetId, setActionTargetId] = useState<number | null>(null);
    const storeId = Cookies.get("current_store_id");

    // إعداد استعلام البيانات
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        if (searchQuery) params.set("name", searchQuery);
        return params;
    }, [currentPage, searchQuery]);

    // جلب البيانات بناءً على التبويب النشط
    const {
        data: followersData,
        isLoading: isLoadingFollowers
    } = useGetMyFollowers(queryParams, storeId); // يتم تفعيله دائماً أو يمكن ربطه بـ enabled

    const {
        data: followingsData,
        isLoading: isLoadingFollowings
    } = useGetMyFollowings(queryParams, storeId);

    // تحديد البيانات الحالية للعرض
    const currentData = activeTab === "followers" ? followersData : followingsData;
    const isLoading = activeTab === "followers" ? isLoadingFollowers : isLoadingFollowings;
    const records = currentData?.data || [];
    const totalRecords = currentData?.recordsFiltered || 0;
    const totalPages = Math.ceil((currentData?.recordsTotal || 0) / 10);

    // Hooks for Actions
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const handleAction = (item: FollowEntity) => {
        setActionTargetId(item.id);

        if (activeTab === "followings") {
            // إلغاء متابعة
            unfollowMutation.mutate(
                {
                    payload: { followed_type: item.type, followed_id: item.id },
                    storeId
                },
                { onSettled: () => setActionTargetId(null) }
            );
        } else {
            // متابعة
            followMutation.mutate(
                {
                    payload: { followed_type: item.type, followed_id: item.id },
                    storeId
                },
                { onSettled: () => setActionTargetId(null) }
            );
        }
    };

    const breadcrumbItems = [
        { label: "الرئيسية", href: "/" },
        { label: "المتابعين" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
            {/* 1. Header with Tabs */}
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="flex items-center justify-between h-16 px-6 container mx-auto">
                    <nav className="flex items-center h-full">
                        <ul className="flex items-center gap-8 h-full">
                            <li className="h-full flex items-center">
                                <button
                                    onClick={() => { setActiveTab("followers"); setCurrentPage(1); }}
                                    className={cn(
                                        "text-sm font-bold h-full flex items-center transition-colors cursor-pointer px-2",
                                        activeTab === "followers"
                                            ? "text-blue-3 border-b-[3px] border-blue-3"
                                            : "text-gray-400 hover:text-blue-3"
                                    )}
                                >
                                    يتابعك
                                </button>
                            </li>
                            <li className="h-full flex items-center">
                                <button
                                    onClick={() => { setActiveTab("followings"); setCurrentPage(1); }}
                                    className={cn(
                                        "text-sm font-bold h-full flex items-center transition-colors cursor-pointer px-2",
                                        activeTab === "followings"
                                            ? "text-blue-3 border-b-[3px] border-blue-3"
                                            : "text-gray-400 hover:text-blue-3"
                                    )}
                                >
                                    تتابعهم
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-6 flex-1">

                {/* 2. Breadcrumb */}
                <div className="mb-6">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                {/* 3. Search */}
                <div className="mb-8">
                    <div className="relative">
                        <Input
                            placeholder="ابحث بالاسم او رقم الموبايل"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white h-12 pe-12 text-right border-gray-200 focus:border-blue-3 rounded-lg shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                </div>

                {/* 4. Content Area */}
                <div className="space-y-4">
                    {/* Title & Count */}
                    <div className="flex justify-end mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2" dir="rtl">
                            {activeTab === "followers" ? "يتابعك" : "تتابعهم"}
                            <span className="text-gray-500 font-normal">({totalRecords})</span>
                        </h2>
                    </div>

                    {/* List or Empty State */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-lg">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                        </div>
                    ) : records.length > 0 ? (
                        <>
                            <FollowersTable
                                data={records}
                                type={activeTab}
                                onAction={handleAction}
                                isActionPending={followMutation.isPending || unfollowMutation.isPending}
                                targetId={actionTargetId}
                            />

                            {totalPages > 1 && (
                                <div className="mt-6">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <FollowersEmptyState
                            message={activeTab === "followers" ? "لا يوجد متابعين حتى الآن" : "لا تتابع أحداً حتى الآن"}
                            description={activeTab === "followers"
                                ? "بمجرد متابعتك من أحد الاشخاص سيظهر هنا من يتابعك"
                                : "قم بالبحث عن متاجر أو مستخدمين لمتابعتهم"}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}