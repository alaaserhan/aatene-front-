"use client";

import { useRef } from "react";
import { Badge } from "@/src/components/ui/badge";
import HomeCarouselNav from "@/src/features/(web)/home/components/HomeCarouselNav";
import { scrollCarouselByItem } from "@/src/lib/scroll-carousel";
import { COMING_SOON, type ComingSoonCard } from "../content";
import LandingImage from "./LandingImage";

const SOON_LABEL = "قريبًا";

/** Takes a key rather than the cards: their lucide icons can't cross the server/client boundary. */
export default function ToolCarousel({ group }: { group: "contentTools" | "creativeTools" }) {
    const cards: ComingSoonCard[] = COMING_SOON[group];
    const trackRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: "left" | "right") => scrollCarouselByItem(trackRef.current, direction);

    return (
        <div className="group/nav relative">
            <HomeCarouselNav
                onPrev={() => scroll("right")}
                onNext={() => scroll("left")}
                className="hidden size-12 opacity-100 md:flex"
            />
            <div
                ref={trackRef}
                className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 overscroll-x-contain md:gap-6"
            >
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article
                            key={card.title}
                            className="flex shrink-0 basis-[72%] snap-start flex-col overflow-hidden rounded-3xl border border-c2-neutral-200 bg-white sm:basis-[calc((100%_-_0.75rem)/2)] md:basis-[calc((100%_-_3rem)/3)] lg:basis-[calc((100%_-_4.5rem)/4)]"
                        >
                            <div className="relative bg-c2-navy-50">
                                <LandingImage asset={card.image} className="w-full rounded-none border-0" />
                                {card.soon ? (
                                    <Badge className="absolute start-3 top-3 rounded-full bg-c2-primary px-3 py-1 text-xs text-white">
                                        {SOON_LABEL}
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="flex flex-1 items-start gap-3 p-4 md:p-5">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-c2-navy-700-a10 p-2 text-c2-navy-700">
                                    <Icon className="size-6" strokeWidth={2} />
                                </span>
                                <div className="flex min-w-0 flex-col">
                                    <h3 className="mb-1 text-lg font-medium text-c2-neutral-950">{card.title}</h3>
                                    <p className="text-sm font-normal leading-relaxed text-c2-navy-560">{card.description}</p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
