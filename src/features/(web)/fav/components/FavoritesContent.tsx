"use client";

import { useState, useEffect } from "react";
import { FavoritesType } from "../FavoritesPage";
import {
    useGetFavorites,
    useGetFavoritesByType,
    useGetFavoriteLists,
    useGetFavoritesInList,
} from "../hooks";
import { FavoriteItem } from "../api";
import EmptyFavorites from "./EmptyFavorites";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import { Store } from "@/src/features/(web)/searchAndFilter/api";
import { Service } from "@/src/features/(web)/services/api";
import { Search, CheckSquare, Plus } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { cn } from "@/src/lib/utils";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { Pagination } from "@/src/components/ui/Pagination";

interface FavoritesContentProps {
    selectedType: FavoritesType;
}

const ITEMS_PER_PAGE = 20;

export default function FavoritesContent({
    selectedType,
}: FavoritesContentProps) {
    const user = useAuthStore((state) => state.user);

    // State
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editListData, setEditListData] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    // Reset selected list and pagination when type changes
    useEffect(() => {
        setSelectedListId(null);
        setCurrentPage(1);
        setSearchQuery("");
    }, [selectedType]);

    // Reset pagination when list changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedListId]);

    // Fetch all favorites (for "all" type)
    const { data: allFavorites, isLoading: isLoadingAll } = useGetFavorites(currentPage);

    // Fetch favorites by type
    const { data: typeFavorites, isLoading: isLoadingType } =
        useGetFavoritesByType(selectedType === "all" ? "" : selectedType, currentPage);

    // Fetch favorite lists (for badge tabs)
    const { data: listsData, isLoading: isLoadingLists } = useGetFavoriteLists(
        selectedType === "all" ? undefined : selectedType
    );

    // Fetch items in selected list
    const { data: listItems, isLoading: isLoadingListItems } = useGetFavoritesInList(
        selectedListId || 0,
        currentPage
    );

    // Determine loading state
    const isLoading = selectedType === "all"
        ? isLoadingAll || isLoadingLists
        : isLoadingType || isLoadingLists;

    // Get the favorites list to display
    const lists = listsData?.lists || [];

    // Determine current data source
    const currentData = selectedListId
        ? listItems
        : (selectedType === "all" ? allFavorites : typeFavorites);

    const favoritesList = currentData?.favorites || [];
    const totalItems = currentData?.total || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Client-side search filtering
    const filteredFavorites = searchQuery.trim()
        ? favoritesList.filter((item) =>
            item.favs?.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        : favoritesList;

    const visibleFavorites = filteredFavorites.filter(
        (item): item is FavoriteItem & { favs: NonNullable<FavoriteItem["favs"]> } =>
            item.favs != null
    );

    // Handle list badge click
    const handleListClick = (listId: number | null) => {
        setSelectedListId(listId);
    };

    const handleEditList = () => {
        const currentList = lists.find(l => l.id === selectedListId);
        if (currentList) {
            setEditListData(currentList);
            setIsCreateModalOpen(true);
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">جاري التحميل...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex  justify-between ">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1F2A37] mb-2">
                        المفضلة
                    </h1>
                    <p className="text-[#6B7280] text-sm md:text-base">
                        احفظ منتجاتك ومحلاتك المفضلة في مكان واحد، وارجع لها وقت ما تحتاج بسهولة.
                    </p>
                </div>
                {/* Add New Collection Button - Only show if not "all" */}
                {selectedType !== "all" && (
                    <button
                        onClick={() => {
                            setEditListData(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="bg-blue-3 text-white h-fit cursor-pointer px-5 py-2.5 rounded-lg text-sm font-medium  transition-colors flex items-center justify-center gap-2 whitespace-nowrap order-1 sm:order-none"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة مجموعة جديدة
                    </button>
                )}

            </div>

            {/* Top Bar: Button + Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 order-2 sm:order-none">
                    <input
                        type="text"
                        placeholder="بحث"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-2.5 border border-[#E5E7EB] rounded-full focus:outline-none focus:ring-0 "
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#3D5E83] rounded-full p-2 cursor-pointer hover:bg-[#2D496A] transition-colors">
                        <Search className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            {/* List Badges/Tabs */}
            {lists.length > 0 && (
                <div className="flex gap-3 items-center overflow-x-auto md:overflow-visible md:flex-wrap">
                    {/* "All Items" badge */}
                    <button
                        onClick={() => handleListClick(null)}
                        className={cn(
                            "px-5 cursor-pointer py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            selectedListId === null
                                ? "bg-[#3D5E83] text-white shadow-md"
                                : "bg-gray-100 text-[#3D5E83] hover:bg-gray-200"
                        )}
                    >
                        جميع العناصر
                    </button>

                    {/* Dynamic list badges */}
                    {lists.map((list) => (
                        <button
                            key={list.id}
                            onClick={() => handleListClick(list.id)}
                            className={cn(
                                "px-5 py-2.5 cursor-pointer rounded-lg text-sm font-medium transition-all duration-200",
                                selectedListId === list.id
                                    ? "bg-[#3D5E83] text-white shadow-md"
                                    : "bg-gray-100 text-[#3D5E83] hover:bg-gray-200"
                            )}
                        >
                            {list.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Selected List Info */}
            {selectedListId && (
                <div className="flex items-center gap-3 text-right">
                    <div onClick={handleEditList} className="cursor-pointer">
                        <img src="icons/dashboard/edit.svg" alt="" className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#1F2A37]">
                            قسم {lists.find(l => l.id === selectedListId)?.name || "المفضلة"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {lists.find(l => l.id === selectedListId)?.is_private ? "مجموعة خاصة" : "مجموعة عامة"} - عدد العناصر: {totalItems}
                        </p>
                    </div>
                </div>
            )}

            {/* Loading state for list items */}
            {isLoadingListItems && selectedListId && (
                <div className="text-center py-10">جاري تحميل العناصر...</div>
            )}

            {/* Empty State — نستبعد العناصر اليتيمة (favs === null) */}
            {visibleFavorites.length === 0 && !isLoadingListItems && (
                <EmptyFavorites type={selectedType} />
            )}

            {/* Products Grid */}
            {visibleFavorites.length > 0 && !isLoadingListItems && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {visibleFavorites.map((item) => {
                            if (item.favs_type === "store") {
                                return <StoreCard key={item.id} store={item.favs as unknown as Store} />;
                            }
                            if (item.favs_type === "service") {
                                return <ServiceCard key={item.id} service={item.favs as unknown as Service} />;
                            }
                            return (
                                <ProductCard
                                    key={item.id}
                                    id={item.favs.id || item.id}
                                    name={item.favs.name || "اسم المنتج"}
                                    slug={item.favs.slug}
                                    cover={item.favs.cover || ""}
                                    price={item.favs.price || "0"}
                                    priceAfterDiscount={item.favs.price_after_discount}
                                    discountPercent={item.favs.discount_present}
                                    reviewRate={item.favs.review_rate}
                                    reviewCount={item.favs.review_count}
                                    isFavorite={item.favs.is_favorite ?? true}
                                    type={item.favs_type as any || "product"}
                                />
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center dir-ltr">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}

            <CreateCollectionModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditListData(null);
                }}
                editData={editListData}
                type={selectedType === "all" ? "product" : selectedType} // Default to product if all, otherwise specific type
            />
        </div>
    );
}
