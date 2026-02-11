"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useGetFollowers, useGetFollowings, useRemoveFollower, useUnfollowUserOrStore } from "../../hooks";
import { cn } from "@/src/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";

export default function FollowingsTab() {
    const [activeTab, setActiveTab] = useState<"followings" | "followers">("followings");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: followingsData, isLoading: isLoadingFollowings } = useGetFollowings();
    const { data: followersData, isLoading: isLoadingFollowers } = useGetFollowers();

    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();
    const { mutate: removeFollower, isPending: isRemoving } = useRemoveFollower();

    const isLoading = activeTab === "followings" ? isLoadingFollowings : isLoadingFollowers;
    const dataList = activeTab === "followings" ? followingsData?.data : followersData?.data;

    const filteredList = dataList?.filter((item: any) => {
        const entity = item.followed || item.follower; // Depending on which endpoint, key might differ?
        // Step 459: followings response: item.followed
        // followers response: item.follower or item.user?
        // Step 459: URL /followers response "Not available" (item 7) / "Body: not specified" (item 4).
        // Standard convention:
        // /followings returns items where user is follower. item.followed is the followed entity.
        // /followers returns items where user is followed. item.follower is the follower entity.
        // I should check if `item.follower` exists. If not, maybe use `item.followed` (unlikely)?
        // Or maybe `item` itself is the user object for `followers`?
        // But `item` in `followings` had `id`, `followed_type`, `followed`.
        // I will assume consistent structure: wrapper object.
        // For `followers`, wrapper probably has `follower_type` and `follower`.
        const target = activeTab === "followings" ? item.followed : (item.follower || item.user || item);
        const name = target?.name || target?.fullname || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

    const handleAction = (item: any) => {
        if (activeTab === "followings") {
            // Unfollow
            unfollow({
                followed_type: item.followed_type,
                followed_id: item.followed.id
            });
        } else {
            // Remove Follower
            removeFollower({
                follower_id: item.follower?.id || item.user?.id || item.id // API needs id?
                // Wait, hook `useRemoveFollower` takes `payload?: any`.
                // Step 470: `removeFollower` endpoint `/followers/remove` (POST). Payload `params`.
                // Assuming it needs `follower_id`.
            });
        }
    };

    const isPending = activeTab === "followings" ? isUnfollowing : isRemoving;

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white">
            {/* Header Section */}
            <div className="flex flex-col mb-6 text-center md:text-right">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    قائمة المتابعين
                </h1>
                <p className="text-gray-400 text-sm">
                    قم باختيار نوع الحساب الذي تريده (تاجر/مقدم خدمات/صاحب منتجات)
                </p>
            </div>

            <div className="border-b border-gray-100 mb-8 w-full" />

            {/* Toggle Switcher */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setActiveTab("followings")}
                    className={cn(
                        "flex-1 py-2 text-sm rounded-full font-medium transition-all cursor-pointer",
                        activeTab === "followings"
                            ? "bg-blue-3 text-white shadow-md shadow-blue-900/10"
                            : "bg-[#F3F6F9] text-blue-4 hover:bg-gray-100"
                    )}
                >
                    أشخاص تتابعهم
                </button>
                <button
                    onClick={() => setActiveTab("followers")}
                    className={cn(
                        "flex-1 py-2 text-sm rounded-full font-medium transition-all cursor-pointer",
                        activeTab === "followers"
                            ? "bg-blue-3 text-white shadow-md shadow-blue-900/10"
                            : "bg-[#F3F6F9] text-blue-4 hover:bg-gray-100"
                    )}
                >
                    متابعين
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-blue-3" />
                </div>
                <input
                    type="text"
                    placeholder="بحث"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-blue-5 rounded-full py-3.5 pr-14 pl-6 focus:outline-none focus:border-blue-3 focus:ring-0 focus:ring-blue-3/10 transition-all text-right placeholder:text-[#92AFD0]"
                />
            </div>

            {/* List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-3" />
                    </div>
                ) : filteredList.length > 0 ? (
                    filteredList.map((item: any, index: number) => {
                        const target = activeTab === "followings" ? item.followed : (item.follower || item.user || item);
                        const name = target?.name || target?.fullname || "مستخدم";
                        const avatar = target?.avatar || target?.logo || "";
                        const count = target?.followers_count || 0;

                        return (
                            <div key={index} className="flex items-center justify-between group">
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-gray-50">
                                        <AvatarImage
                                            src={avatar}
                                            alt={name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-blue-5 text-blue-3 text-xs">
                                            {(name[0] || "U").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-right">
                                        <h3 className="font-semibold text-sm text-[#3D3D3D]">
                                            {name}
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            متابعين {count}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleAction(item)}
                                    disabled={isPending}
                                    className="bg-[#3D5E83] text-white px-6 py-2 rounded-full cursor-pointer text-xs font-medium hover:bg-[#324d6d] transition-colors disabled:opacity-50"
                                >
                                    {activeTab === "followings" ? "إلغاء المتابعة" : "إزالة"}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">
                            {activeTab === "followings" ? "لا تتابع أحداً حالياً" : "لا يوجد متابعين"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
