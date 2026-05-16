"use client";

import React, { useRef } from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import { Service } from "../types";
import { cn } from "@/src/lib/utils";
import HomeViewAllLink from "./HomeViewAllLink";
import HomeCarouselNav from "./HomeCarouselNav";

interface HomeServicesCarouselProps {
  title: string;
  services: Service[];
  viewAllHref?: string;
  showViewAll?: boolean;
  className?: string;
  titleClassName?: string;
}

export default function HomeServicesCarousel({
  title,
  services,
  viewAllHref = "/search?type=services",
  showViewAll = true,
  className,
  titleClassName,
}: HomeServicesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    const newScrollLeft =
      direction === "left"
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (!services?.length) return null;

  return (
    <section className={cn("py-8 relative overflow-hidden", className)} dir="rtl">
      <MaxWidthWrapper className="relative z-20">
        <div className="flex items-center justify-between mb-10">
          <h2
            className={cn(
              "text-2xl md:text-3xl text-blue-4 font-medium relative inline-block",
              titleClassName
            )}
          >
            {title}
          </h2>
          {showViewAll ? <HomeViewAllLink href={viewAllHref} /> : null}
        </div>

        <div className="relative group/nav">
          <HomeCarouselNav onPrev={() => scroll("left")} onNext={() => scroll("right")} />

          <div
            ref={scrollContainerRef}
            className="flex flex-row flex-nowrap overflow-x-auto gap-4 md:gap-6 pb-4 scroll-smooth scrollbar-hide snap-x snap-mandatory touch-pan-x overscroll-x-contain"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {services.map((service) => (
              <div
                key={service.id}
                className="flex-none w-[72vw] max-w-[280px] sm:min-w-[260px] sm:w-auto snap-start"
              >
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
