"use client";

import React from "react";
import { Product } from "../types";
import { useMostPopularSingle } from "../hooks";
import HomeProductsCarousel from "./HomeProductsCarousel";

interface HomeCustomizedProductsProps {
  products?: Product[];
}

export default function HomeCustomizedProducts({ products: initialProducts }: HomeCustomizedProductsProps) {
  const { data: response } = useMostPopularSingle();
  const products = initialProducts || response?.data || [];

  return (
    <HomeProductsCarousel
      title="المنتجات الأكثر استخدامًا"
      products={products}
      className="py-12 bg-white"
    />
  );
}
