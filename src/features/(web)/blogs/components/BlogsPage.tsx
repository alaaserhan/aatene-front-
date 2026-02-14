"use client";

import { usePublicBlogs } from "../hooks";
import { Blog } from "../types";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/src/stores/auth-store";
import { MessageCircle, Heart, Plus } from "lucide-react";
import { Pagination } from "@/src/components/ui/Pagination";
import { useState } from "react";

function BlogCard({ blog, isHero = false }: { blog: Blog; isHero?: boolean }) {
    if (isHero) {
        return (
            <Link href={`/blogs/${blog.slug || blog.id}`} className="block relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden group">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={blog.thumbnail_url || "/assets/images/placeholder.jpg"}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Content Overlay Card */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white rounded-xl p-5 shadow-lg">
                        <div className="flex flex-col gap-2">
                            {/* Category Badge */}
                            <div className="flex ">
                                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md font-medium">
                                    {blog.category}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl md:text-3xl font-medium  pb-2">
                                {blog.title}
                            </h2>

                            {/* Footer: Date (Right) and Icons (Left) */}
                            <div className="flex items-center justify-between text-gray-400 text-sm mt-2  pt-4">
                                <span>{getRelativeTimeArabic(blog.created_at)}</span>
                                <div className="flex items-center gap-6">
                                    {/* Comment Icon with Badge */}
                                    <div className="relative">
                                        <MessageCircle className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
                                        <span className="absolute -top-2 border-2 border-white -right-4 bg-blue-3 text-white text-[8px] md:text-[9px] font-medium px-2 py-[1px] rounded-full min-w-[24px] flex items-center justify-center">
                                            {blog.review_count || "+99"}
                                        </span>
                                    </div>

                                    {/* Heart Icon with Badge */}
                                    <div className="relative">
                                        <Heart className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
                                        <span className="absolute -top-2 border-2 border-white -right-4 bg-blue-3 text-white text-[8px] md:text-[9px] font-medium px-2 py-[1px] rounded-full min-w-[20px] flex items-center justify-center">
                                            {blog.favorites_count || "6"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/blogs/${blog.slug || blog.id}`} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-sm transition-all duration-300 group flex flex-col h-full">
            <div className="relative h-56 w-full overflow-hidden">
                <Image
                    src={blog.thumbnail_url || "/assets/images/placeholder.jpg"}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            <div className="p-5 flex-1 flex flex-col items-start text-right">

                {/* Category Badge - Light Blue */}
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md font-medium mb-3 inline-block">
                    {blog.category}
                </span>

                <h3 className="text-xl font-medium mb-3 transition-colors line-clamp-2 leading-relaxed">
                    {blog.title}
                </h3>

                <div className="mt-auto flex items-center w-full text-xs text-gray-400">
                    <span>{getRelativeTimeArabic(blog.created_at)}</span>
                </div>
            </div>
        </Link>
    );
}


export default function BlogsPage() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
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
            <div className="flex justify-between mb-8 md:mb-12">
                <h1 className="text-2xl font-medium ">جميع المقالات</h1>

                {isLoggedIn && (
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
