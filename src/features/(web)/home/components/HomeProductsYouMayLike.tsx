"use client";

import React from "react";
import { Product } from "../types";
import { useMayLike } from "../hooks";
import HomeProductsCarousel from "./HomeProductsCarousel";

interface HomeProductsYouMayLikeProps {
  products?: Product[];
}

export default function HomeProductsYouMayLike({ products: initialProducts }: HomeProductsYouMayLikeProps) {
  const { data: response } = useMayLike();
  const products = initialProducts || response?.data || [];

  return (
    <HomeProductsCarousel
      title="منتجات قد تعجبك"
      products={products}
      className="py-12 bg-white"
    />
  );
}
