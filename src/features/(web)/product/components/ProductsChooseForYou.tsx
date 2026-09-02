"use client";

import ProductCard from "./ProductCard";
import { ProductInPageData } from "../types";

export interface ProductsChooseForYouProps {
    products: ProductInPageData[];
}

export default function ProductsChooseForYou({ products }: ProductsChooseForYouProps) {
    if (!products || products.length === 0) return null;

    return (
        <div className="my-8">
            <h2 className="heading-lg">المنتجات الأعلى تقييما</h2>

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
                        ask_for_price={product.ask_for_price}
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

