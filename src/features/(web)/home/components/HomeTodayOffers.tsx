"use client";

import React from "react";
import { Product } from "../types";
import { useTodayOffers } from "../hooks";
import HomeProductsCarousel from "./HomeProductsCarousel";

interface HomeTodayOffersProps {
  products?: Product[];
}

export default function HomeTodayOffers({ products: initialProducts }: HomeTodayOffersProps) {
  const { data: response } = useTodayOffers();
  const products = initialProducts || response?.data || [];

  return (
    <HomeProductsCarousel
      title="عروض اليوم الكبرى"
      products={products}
      viewAllHref="/search?type=products&has_discount=1"
      className="py-12 bg-gray-50 bg-linear-to-b from-gray-50 to-white"
    />
  );
}
