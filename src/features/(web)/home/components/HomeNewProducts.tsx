"use client";

import React from "react";
import { Product } from "../types";
import { useNewProducts } from "../hooks";
import HomeProductsCarousel from "./HomeProductsCarousel";

interface HomeNewProductsProps {
  products?: Product[];
}

export default function HomeNewProducts({ products: initialProducts }: HomeNewProductsProps) {
  const { data: response } = useNewProducts();
  const products = initialProducts || response?.data || [];

  return (
    <HomeProductsCarousel
      title="منتجات وصلت حديثًا"
      products={products}
      showViewAll
      className="py-5 md:pb-12 md:pt-8 bg-linear-to-b from-gray-50 to-white"
    />
  );
}
