"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Blog as DomainBlog } from "../../blogs/types";
import HomeBlogCard from "./HomeBlogCard";
import { useLatestBlogs } from "../hooks";
import { Blog as HomeBlog } from "../types";
import HomeViewAllLink from "./HomeViewAllLink";

interface HomeLatestBlogsProps {
  blogs?: HomeBlog[];
}

export default function HomeLatestBlogs({ blogs: initialBlogs }: HomeLatestBlogsProps) {
  const { data: response } = useLatestBlogs();
  const blogs = initialBlogs || response?.data || [];

  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="py-12 bg-white" dir="rtl">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl text-blue-4 font-medium relative inline-block">
            آخر المقالات
          </h2>
          <HomeViewAllLink href="/blogs" label="اقرأ جميع المدونات" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((blog) => (
            <div key={blog.id} className="relative">
              <HomeBlogCard blog={blog as unknown as DomainBlog} />
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
