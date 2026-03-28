// src/app/(admin)/favorites/[id]/UserFavoritesList.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, Search, Calendar } from "lucide-react";
import { formatDate } from "@/src/lib/date-helper";
import { toast } from "sonner";

import {
    useGetUserFavorites,
    useGetUserFavoriteLists,
    useDeleteUserFavoritesByType
} from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { cn } from "@/src/lib/utils";

interface UserFavoritesListProps {
    userId: string;
}

const ITEMS_PER_PAGE = 8;

export function UserFavoritesList({ userId }: UserFavoritesListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const type = searchParams.get("type") || "product";
    const listId = searchParams.get("list_id") || "";

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Modal State
    const [isDeleteTypeModalOpen, setIsDeleteTypeModalOpen] = useState(false);

    // 1. Fetch Lists (Tabs)
    const { data: listsData } = useGetUserFavoriteLists(userId, type);
    const lists = listsData?.lists || [];

    // 2. Fetch Items
    const queryParams = new URLSearchParams();
    queryParams.set("type", type);
    queryParams.set("page", page.toString());
    queryParams.set("per_page", ITEMS_PER_PAGE.toString());
    if (listId) queryParams.set("list_id", listId);
    if (search) queryParams.set("search", search);

    const { data: favoritesData, isLoading: isLoadingItems } = useGetUserFavorites(userId, queryParams);
    const items = favoritesData?.favorites || [];
    const totalPages = Math.ceil((favoritesData?.total || 0) / ITEMS_PER_PAGE);

    // 3. Delete Mutation (By Type Only)
    const { mutate: deleteByType, isPending: isDeletingType } = useDeleteUserFavoritesByType();

    // Handlers
    const handleTabClick = (id: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set("list_id", id);
        } else {
            params.delete("list_id");
        }
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDeleteAllByType = () => {
        deleteByType({
            userId,
            type: type
        }, {
            onSuccess: () => {
                setIsDeleteTypeModalOpen(false);
            }
        });
    };

    const getTitleByType = () => {
        switch (type) {
            case "product": return "المنتجات المفضلة";
            case "store": return "المتاجر المفضلة";
            case "service": return "الخدمات المفضلة";
            default: return "العناصر المفضلة";
        }
    };

    return (
        <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200">

            {/* Header & Delete Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium ">{getTitleByType()}</h2>

                {/* Delete By Type Button (Visible only if there are items) */}
                {items.length > 0 && !isLoadingItems && (
                    <Button
                        onClick={() => setIsDeleteTypeModalOpen(true)}
                        className="bg-red-2 hover:bg-[#FECDD3] rounded-sm text-[#F43F5E] border-none h-8 w-8 p-0 flex items-center justify-center transition-colors"
                        disabled={isDeletingType}
                        title={`حذف جميع ${getTitleByType()}`}
                    >
                        {isDeletingType ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <img src="/icons/dashboard/trash.svg" alt="حذف" className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>

            {/* Tabs (Lists) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => handleTabClick(null)}
                    className={cn(
                        "px-4 py-2 rounded-sm text-sm font-medium transition-colors whitespace-nowrap",
                        !listId
                            ? "bg-blue-4 text-white "
                            : "bg-gray-100 text-gray-2 hover:bg-gray-200"
                    )}
                >
                    جميع العناصر
                </button>
                {lists.map(list => (
                    <button
                        key={list.id}
                        onClick={() => handleTabClick(String(list.id))}
                        className={cn(
                            "px-4 py-2 rounded-sm text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
                            listId === String(list.id)
                                ? "bg-blue-4 text-white "
                                : "bg-gray-100 text-gray-2 hover:bg-gray-200"
                        )}
                    >
                        {list.name}
                        <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full",
                            listId === String(list.id) ? "bg-white/20 text-white" : "bg-gray-200 text-gray-2"
                        )}>
                            {list.favs_count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder={`ابحث باسم ${type === 'product' ? 'المنتج' : type === 'store' ? 'المتجر' : 'الخدمة'}...`}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pr-10 h-11 bg-white border-gray-200  w-full "
                    />
                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-2" />
                </div>
            </div>

            {/* List Content */}
            <div className="bg-white rounded-xl border border-gray-100 min-h-[400px] flex flex-col">
                {isLoadingItems ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                        <span className="mt-2 text-gray-2">جاري التحميل...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 text-gray-2">
                        لا توجد عناصر في هذه القائمة
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-gray-50">
                        {/* No Checkboxes Header */}

                        {items.map((fav) => (
                            <div key={fav.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">

                                {/* Image */}
                                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                    {fav.item ? (
                                        <img src={fav.item.gallery_urls[0] || fav.item.image_url} alt={fav.item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Img</div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex flex-col flex-1 gap-1">
                                    <h4 className="text-sm font-medium  line-clamp-1">{fav.item?.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-2">
                                        <Calendar className="w-3 h-3" />
                                        <span className="pt-1">{formatDate(fav.created_at, "yyyy-MM-dd")}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 mt-auto flex justify-center">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            {/* Modal: Confirm Delete All By Type */}
            <ConfirmDeleteModal
                isOpen={isDeleteTypeModalOpen}
                onClose={() => setIsDeleteTypeModalOpen(false)}
                onConfirm={handleDeleteAllByType}
                title={`حذف جميع ${getTitleByType()}`}
                description={`تحذير: سيتم حذف جميع ${getTitleByType()} لهذا المستخدم نهائياً. هل أنت متأكد؟`}
            />
        </div>
    );
}