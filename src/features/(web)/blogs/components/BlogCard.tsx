"use client";

import { MessageCircle, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "../types";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";

export function BlogCard({ blog, isHero = false }: { blog: Blog; isHero?: boolean }) {
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
                                        <span className="absolute -top-2 border-2 border-white -right-4 bg-blue-3 text-white text-[8px] md:text-[9px] font-medium px-2 py-px rounded-full min-w-[24px] flex items-center justify-center">
                                            {blog.review_count || "+99"}
                                        </span>
                                    </div>

                                    {/* Heart Icon with Badge */}
                                    <div className="relative">
                                        <Heart className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
                                        <span className="absolute -top-2 border-2 border-white -right-4 bg-blue-3 text-white text-[8px] md:text-[9px] font-medium px-2 py-px rounded-full min-w-[20px] flex items-center justify-center">
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
