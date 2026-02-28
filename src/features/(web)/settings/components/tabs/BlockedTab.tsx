"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetBlockedUsers, useUnblockUser } from "../../hooks";
import { cn } from "@/src/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";

export default function BlockedTab() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlType = searchParams.get("type") || searchParams.get("blocked_type");
    const urlUser = searchParams.get("user");

    const [type, setType] = useState<"store" | "user">((urlType as "store" | "user") || "store");
    const [searchQuery, setSearchQuery] = useState(urlUser || "");

    useEffect(() => {
        if (urlType === "store" || urlType === "user") {
            setType(urlType);
        }
        if (urlUser) {
            setSearchQuery(urlUser);
        }
    }, [urlType, urlUser]);

    const handleTypeChange = (newType: "store" | "user") => {
        setType(newType);
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", newType);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const { data: blockedData, isLoading } = useGetBlockedUsers(type);
    const { mutate: unblock, isPending: isUnblocking } = useUnblockUser();

    const filteredUsers = blockedData?.participants?.filter((item) => {
        const name = item.participant_data.name || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

    const handleUnblock = (blockedId: string | number) => {
        unblock({
            blocked_type: type,
            blocked_id: blockedId,
        });
    };

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white">
            {/* Header Section */}
            <div className="flex flex-col mb-6 text-center md:text-right">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    قائمة الحظر
                </h1>
                <p className="text-gray-400 text-sm">
                    قم باختيار نوع الحساب الذي تريده (تاجر/مقدم خدمات/صاحب منتجات)
                </p>
            </div>

            <div className="border-b border-gray-100 mb-8 w-full" />

            {/* Toggle Switcher */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => handleTypeChange("store")}
                    className={cn(
                        "flex-1 py-2 text-sm rounded-full font-medium transition-all cursor-pointer",
                        type === "store"
                            ? "bg-blue-3 text-white shadow-md shadow-blue-900/10"
                            : "bg-[#F3F6F9] text-blue-4 hover:bg-gray-100"
                    )}
                >
                    متاجر
                </button>
                <button
                    onClick={() => handleTypeChange("user")}
                    className={cn(
                        "flex-1 py-2 text-sm rounded-full font-medium transition-all cursor-pointer",
                        type === "user"
                            ? "bg-blue-3 text-white shadow-md shadow-blue-900/10"
                            : "bg-[#F3F6F9] text-blue-4 hover:bg-gray-100"
                    )}
                >
                    مستخدمين
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
                    className="w-full bg-white  border border-blue-5 rounded-full py-3.5 pr-14 pl-6 focus:outline-none focus:border-blue-3 focus:ring-0 focus:ring-blue-3/10 transition-all text-right placeholder:text-[#92AFD0]"
                />
            </div>

            {/* List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-3" />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((item) => (
                        <div key={item.id} className="flex items-center justify-between group">
                            {/* User Info */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-gray-50">
                                    <AvatarImage
                                        src={item.participant_data.avatar || ""}
                                        alt={item.participant_data.name || ""}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-blue-5 text-blue-3 text-xs">
                                        {(item.participant_data.name?.[0] || "U").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-right">
                                    <h3 className="font-semibold text-sm text-[#3D3D3D]">
                                        {item.participant_data.name || "مستخدم"}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        متابعين {item.participant_data.followers_count || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleUnblock(item.participant_data.id)}
                                disabled={isUnblocking}
                                className="bg-[#3D5E83] text-white px-6 py-2 rounded-full cursor-pointer text-xs font-medium hover:bg-[#324d6d] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                إلغاء الحظر
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">لا يوجد أشخاص محظورين</p>
                    </div>
                )}
            </div>
        </div>
    );
}
