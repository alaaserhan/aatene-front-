"use client";

import React from "react";
import { Service } from "../types";
import { usePopularServices } from "../hooks";
import { ServicesCarouselSkeleton } from "./HomeSkeletons";
import HomeServicesCarousel from "./HomeServicesCarousel";

interface HomeMostPopularServicesProps {
  services?: Service[];
}

export default function HomeMostPopularServices({ services: initialServices }: HomeMostPopularServicesProps) {
  const hasInitialData = Boolean(initialServices?.length);
  const { data: response, isLoading } = usePopularServices({
    enabled: !hasInitialData,
  });
  const services = hasInitialData ? initialServices! : response?.data || [];

  if (isLoading && !hasInitialData) return <ServicesCarouselSkeleton />;
  if (!services?.length) return null;

  return (
    <HomeServicesCarousel
      title="الخدمات الأكثر استخدامًا"
      services={services}
      className="py-12 bg-white"
    />
  );
}
