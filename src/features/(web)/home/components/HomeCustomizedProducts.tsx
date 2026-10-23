"use client";

import React from "react";
import { usePopularProducts } from "../hooks";
import HomeProductsCarousel from "./HomeProductsCarousel";

export default function HomeCustomizedProducts() {
  const { data: response } = usePopularProducts();
  const products = response?.data || [];

  return (
    <HomeProductsCarousel
      title="المنتجات الأكثر استخدامًا"
      products={products}
      className="py-12 bg-white"
    />
  );
}
