"use client";

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Blog } from "../../blogs/types";
import { sanitizeMediaUrl } from "@/src/lib/utils";

interface HomeBlogCardProps {
    blog: Blog;
}

export default function HomeBlogCard({ blog }: HomeBlogCardProps) {
    const [thumbnailError, setThumbnailError] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const formattedDate = new Intl.DateTimeFormat("ar-SA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(blog.created_at));

    const thumbnailSrc = sanitizeMediaUrl(blog.thumbnail_url) && !thumbnailError
        ? sanitizeMediaUrl(blog.thumbnail_url)
        : "/images/placeholders/product-placeholder.svg";
    const avatarSrc = sanitizeMediaUrl(blog.user?.avatar_url || blog.store?.logo_url) && !avatarError
        ? sanitizeMediaUrl(blog.user?.avatar_url || blog.store?.logo_url)
        : "/images/placeholders/avatar-placeholder.svg";

    return (
        <Link href={`/blogs/${blog.slug}`} className="block group">
            {/* Image Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                <Image
                    src={thumbnailSrc}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setThumbnailError(true)}
                />
            </div>

            {/* Author & Date */}

            <div className="flex items-center justify-start gap-2 text-sm text-gray-2 mb-2">
                <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                        <Image
                            src={avatarSrc}
                            alt={blog.user?.first_name || "User"}
                            fill
                            className="object-cover"
                            onError={() => setAvatarError(true)}
                        />
                    </div>
                    <span className="font-medium">
                        {blog.user ? `${blog.user.first_name} ${blog.user.last_name}` : blog.store?.name || "مستخدم"}
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
