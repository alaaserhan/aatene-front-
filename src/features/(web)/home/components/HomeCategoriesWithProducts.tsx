"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { CategoryWithProducts } from "@/src/features/(web)/home/types";
import HomeCategorySection from "./HomeCategorySection";
import { useCategoriesWithProducts } from "../hooks";

interface HomeCategoriesWithProductsProps {
    categories?: CategoryWithProducts[];
}

export default function HomeCategoriesWithProducts({ categories: initialCategories }: HomeCategoriesWithProductsProps) {
    const { data: response } = useCategoriesWithProducts();
    const categories = initialCategories || response?.data || [];

    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-12 bg-gray-50/50">
            <MaxWidthWrapper>
                <div className="flex flex-col gap-8">
                    {categories.map((category) => (
                        <HomeCategorySection key={category.id} category={category} />
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
