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
      title="منتجات وصلت حديثا"
      products={products}
      showViewAll
      className="pb-12 pt-4 bg-linear-to-b from-gray-50 to-white"
    />
  );
}
