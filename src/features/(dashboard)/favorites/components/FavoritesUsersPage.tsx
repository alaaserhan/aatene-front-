"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Search, User } from "lucide-react";
import { useGetUsersWithFavorites } from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { Input } from "@/src/components/ui/input";

const ITEMS_PER_PAGE = 10;

export function FavoritesUsersPage() {
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const queryParams = new URLSearchParams();
    queryParams.set("page", page.toString());
    queryParams.set("per_page", ITEMS_PER_PAGE.toString());
    if (search) queryParams.set("search", search);

    const { data: usersData, isLoading } = useGetUsersWithFavorites(queryParams);

    const totalPages = Math.ceil((usersData?.total || 0) / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6 p-6 ">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold ">إدارة المفضلة</h1>
                <p className="text-gray-500 text-sm">
                    تابع تفضيلات المستخدمين، وقم بمراجعة وتنظيم المنتجات والمتاجر المضافة إلى المفضلة.
                </p>
            </div>

            <div className="bg-white rounded-xl  border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Input
                            placeholder="ابحث باسم المستخدم..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pr-10 h-11  border-gray-200 focus:border-[#3A5779] transition-all w-full"
                        />
                        <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className=" border-b bg-[#FAFAFA] border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-right text-xs font-medium">المستخدم</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">عدد المجموعات</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">عدد المنتجات المفضلة</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">عدد المتاجر المفضلة</th>
                                <th className="px-6 py-4 text-center text-xs font-medium">عدد الخدمات المفضلة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span>جاري التحميل...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : usersData?.users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-gray-500">
                                        لا يوجد مستخدمين
                                    </td>
                                </tr>
                            ) : (
                                usersData?.users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* User Info */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium ">{user.name}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Total Collections */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium ">
                                                {user.favs_count.total}
                                            </span>
                                        </td>

                                        {/* Products Count - Clickable */}
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/admin/favorites/${user.id}?type=product`}
                                                className="text-sm font-medium hover:text-blue-800 transition-colors"
                                            >
                                                {user.favs_count.products}
                                            </Link>
                                        </td>

                                        {/* Stores Count - Clickable */}
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/admin/favorites/${user.id}?type=store`}
                                                className="text-sm font-medium hover:text-blue-800 transition-colors"
                                            >
                                                {user.favs_count.stores}
                                            </Link>
                                        </td>

                                        {/* Services Count - Clickable */}
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/admin/favorites/${user.id}?type=service`}
                                                className="text-sm font-medium hover:text-blue-800 transition-colors"
                                            >
                                                {user.favs_count.services}
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}