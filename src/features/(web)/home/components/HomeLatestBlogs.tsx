"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import Link from "next/link";
import { ChevronsLeft } from "lucide-react";
import { Blog } from "../../blogs/types";
import HomeBlogCard from "./HomeBlogCard";

interface HomeLatestBlogsProps {
    blogs: Blog[];
}

export default function HomeLatestBlogs({ blogs }: HomeLatestBlogsProps) {
    if (!blogs || blogs.length === 0) return null;

    return (
        <section className="py-12 bg-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium">
                        آخر المقالات
                    </h2>
                    <Link href="/blogs" className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2c4461] transition-colors">
                        اقرأ جميع المدونات
                        <ChevronsLeft className="w-4 h-4 mr-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.slice(0, 3).map((blog) => (
                        <div key={blog.id} className="relative">
                            <HomeBlogCard blog={blog} />
                        </div>
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
