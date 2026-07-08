"use client";

import React from "react";
import { Service } from "../types";
import { useSpecialServices } from "../hooks";
import { ServicesCarouselSkeleton } from "./HomeSkeletons";
import HomeServicesCarousel from "./HomeServicesCarousel";

interface HomeSpecialServicesProps {
  services?: Service[];
}

export default function HomeSpecialServices({ services: initialServices }: HomeSpecialServicesProps) {
  const { data: response, isLoading } = useSpecialServices();
  const services = initialServices || response?.data || [];

  if (isLoading && !initialServices) return <ServicesCarouselSkeleton showViewAll={false} />;
  if (!services?.length) return null;

  return (
    <HomeServicesCarousel
      title="الخدمات الأكثر تقييمًا"
      services={services}
      showViewAll={true}
      className="py-12 bg-white"
    />
  );
}
