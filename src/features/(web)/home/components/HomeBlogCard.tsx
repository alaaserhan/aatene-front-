"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Blog } from "../../blogs/types";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface HomeBlogCardProps {
    blog: Blog;
}

export default function HomeBlogCard({ blog }: HomeBlogCardProps) {
    const formattedDate = format(new Date(blog.created_at), "dd MMMM yyyy", { locale: arSA });

    return (
        <Link href={`/blogs/${blog.slug}`} className="block group">
            {/* Image Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                <Image
                    src={blog.thumbnail_url || "/placeholder.png"}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Author & Date */}

            <div className="flex items-center justify-start gap-2 text-sm text-gray-2 mb-2">
                <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                        <Image
                            src={blog.user?.avatar_url || "/placeholder-user.jpg"}
                            alt={blog.user?.first_name || "User"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="font-medium">
                        {blog.user ? `${blog.user.first_name} ${blog.user.last_name}` : "مستخدم"}
                    </span>
                </div>
                <span className="text-gray-400">•</span>
                <span>{formattedDate}</span>
            </div>
            {/* Title */}
            <h3 className="  font-medium mb-2 " dir="rtl">
                {blog.title}
            </h3>

            {/* Description / Excerpt */}
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 text-right" dir="rtl">
                {blog.description}
            </p>
        </Link>
    );
}
