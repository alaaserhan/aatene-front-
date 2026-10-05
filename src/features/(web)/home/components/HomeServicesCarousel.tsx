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
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!services?.length) return null;

  return (
    <section className={cn("py-8 relative overflow-hidden", className)} dir="rtl">
      <MaxWidthWrapper className="relative z-20">
        <div className="mb-6 flex items-start justify-between gap-3 sm:items-center">
          <h2
            className={cn(
              "heading-3",
              titleClassName
            )}
          >
            {title}
          </h2>
          {showViewAll ? <HomeViewAllLink href={viewAllHref} /> : null}
        </div>

        <div className="relative group/nav">
          <HomeCarouselNav onPrev={() => scroll("right")} onNext={() => scroll("left")} />

          <div
            ref={scrollContainerRef}
            className="flex w-full flex-row flex-nowrap items-stretch overflow-x-auto gap-3 md:gap-6 pb-4 scroll-smooth scrollbar-hide snap-x snap-mandatory touch-auto overscroll-x-contain"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {services.map((service) => (
              <div
                key={service.id}
                /* Same widths as the services search grid (2 / 3 / 4 columns) — basis accounts for the gaps */
                className="flex shrink-0 snap-start flex-col basis-[calc((100%_-_0.75rem)/2)] md:basis-[calc((100%_-_3rem)/3)] lg:basis-[calc((100%_-_4.5rem)/4)]"
                dir="rtl"
              >
                <ServiceCard service={service} className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
