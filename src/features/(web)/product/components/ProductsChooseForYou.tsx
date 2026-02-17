"use client";

import ProductCard from "./ProductCard";
import { ProductInPageData } from "../types";

export interface ProductsChooseForYouProps {
    products: ProductInPageData[];
}

export default function ProductsChooseForYou({ products }: ProductsChooseForYouProps) {
    if (!products || products.length === 0) return null;

    return (
        <div className="mt-16 mb-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-medium mb-2">تم اختياره لأجلك</h2>
                <p className="text-gray-2 text-sm">أفضل المنتجات مبيعاً من بائعين موثوق بهم | ممول</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        cover={product.cover || ""}
                        price={product.price}
                        priceAfterDiscount={product.price_after_discount}
                        discountPercent={product.discount_present}
                        reviewRate={product.review_rate}
                        isFavorite={product.is_favorite}
                    />
                ))}
            </div>
        </div>
    );
}

