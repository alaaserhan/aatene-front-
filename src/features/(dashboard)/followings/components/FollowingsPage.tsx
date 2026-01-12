"use client";

import { useState, useMemo } from "react";
import { Input } from "@/src/components/ui/input";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Search, Loader2, Users } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useGetMyFollowers, useGetMyFollowings, useFollowUser, useUnfollowUser } from "../hooks";
import { FollowersTable } from "./FollowersTable";
import { FollowersEmptyState } from "./FollowersEmptyState";
import { FollowEntity } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";
import Cookies from "js-cookie";
import { StoreEmptyState } from "@/src/components/(dashboard)/StoreEmptyState"; // ✅ استيراد المكون

type TabType = "followers" | "followings";

export function FollowingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("followers");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [actionTargetId, setActionTargetId] = useState<number | null>(null);

    const storeIdStr = Cookies.get("current_store_id");
    const storeId = storeIdStr ? Number(storeIdStr) : undefined;
    const hasStore = !!storeId && !isNaN(storeId);

    // إعداد استعلام البيانات
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        if (searchQuery) params.set("name", searchQuery);
        return params;
    }, [currentPage, searchQuery]);

    // ملاحظة: يُفضل تمرير { enabled: hasStore } للهوكس إذا كانت تدعم ذلك لتجنب استدعاء API بلا فائدة
    const {
        data: followersData,
        isLoading: isLoadingFollowers
    } = useGetMyFollowers(queryParams, storeId);

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

    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const handleAction = (item: FollowEntity) => {
        if (!storeId) return;
        setActionTargetId(item.id);

        if (activeTab === "followings") {
            unfollowMutation.mutate(
                {
                    payload: { followed_type: item.type, followed_id: item.id },
                    storeId
                },
                { onSettled: () => setActionTargetId(null) }
            );
        } else {
            followMutation.mutate(
                {
                    payload: { followed_type: item.type, followed_id: item.id },
                    storeId
                },
                { onSettled: () => setActionTargetId(null) }
            );
        }
    };

    if (!hasStore) {
        return (
            <div className="p-6 h-screen flex items-center justify-center">
                <StoreEmptyState
                    title="يجب إنشاء متجر أولاً"
                    description="لعرض المتابعين والمتابعات، يجب أن تمتلك متجراً واحداً على الأقل."
                />
            </div>
        );
    }

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
                                            : "text-gray-2 hover:text-blue-3"
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
                                            : "text-gray-2 hover:text-blue-3"
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
                <div className="my-3">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                {/* 3. Search */}
                <div className="mb-4">
                    <div className="relative">
                        <Input
                            placeholder="ابحث بالاسم او رقم الموبايل"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white  h-12 "
                        />
                        <Search className="absolute left-3 top-3 text-gray-2 w-5 h-5" />
                    </div>
                </div>

                {/* 4. Content Area */}
                <div className="space-y-4 bg-white rounded-lg border border-gray-200 p-2">
                    {/* Title & Count */}
                    <div className="flex  mb-4">
                        <h2 className="text-xl flex flex-row items-center gap-1 font-medium p-2">
                            <Users className="w-4" />
                            {activeTab === "followers" ? "يتابعك" : "تتابعهم"}
                            <span className="text-gray-2 font-normal text-base">({totalRecords})</span>
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