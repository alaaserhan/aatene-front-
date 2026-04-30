"use client";

import { usePublicBlogs } from "../hooks";
import Link from "next/link";
import { useAuthStore } from "@/src/stores/auth-store";
import { Plus } from "lucide-react";
import { Pagination } from "@/src/components/ui/Pagination";
import { useState } from "react";

import { BlogCard } from "./BlogCard";


export default function BlogsPage() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = usePublicBlogs({
        page,
        per_page: 9 // One hero + others
    });

    const blogs = data?.records || [];
    const totalPages = data ? Math.ceil(data.recordsTotal / 9) : 1;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                حدث خطأ أثناء تحميل المقالات
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 my-4 md:my-6">
            {/* Header */}
            <div className="flex justify-between mb-5">
                <h1 className="text-2xl font-medium ">جميع المقالات</h1>

                {isHydrated && isLoggedIn && (
                    <Link
                        href="/my/blogs/create"
                        className="bg-blue-3 text-white px-4 py-2 rounded-sm text-sm flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>أضف مقال</span>
                    </Link>
                )}
            </div>

            {/* Content Grid */}
            {blogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Hero Section - Takes full width on mobile, 2 cols on desktop if available */}
                    {blogs[0] && (
                        <div className="md:col-span-2 lg:col-span-2 row-span-2">
                            <BlogCard blog={blogs[0]} isHero={true} />
                        </div>
                    )}

                    {/* Remaining Items */}
                    {blogs.slice(1).map((blog) => (
                        <div key={blog.id} className="min-h-[300px]">
                            <BlogCard blog={blog} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">لا توجد مقالات مضافة حالياً</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}
