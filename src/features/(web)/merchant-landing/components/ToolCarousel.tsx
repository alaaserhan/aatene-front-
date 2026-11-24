"use client";

import { useRef } from "react";
import { Badge } from "@/src/components/ui/badge";
import HomeCarouselNav from "@/src/features/(web)/home/components/HomeCarouselNav";
import { scrollCarouselByItem } from "@/src/lib/scroll-carousel";
import { cn } from "@/src/lib/utils";
import { COMING_SOON, type ComingSoonCard, type CreativeToolCard } from "../content";
import LandingImage from "./LandingImage";

const SOON_LABEL = "قريبًا";

/** Takes a key rather than the cards: their lucide icons can't cross the server/client boundary. */
export default function ToolCarousel({ group }: { group: "contentTools" | "creativeTools" }) {
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
                {group === "contentTools"
                    ? COMING_SOON.contentTools.map((card) => <ContentToolItem key={card.title} card={card} />)
                    : COMING_SOON.creativeTools.map((card) => <CreativeToolItem key={card.title} card={card} />)}
            </div>
        </div>
    );
}

const CARD_CLASS =
    "flex shrink-0 basis-[72%] snap-start flex-col overflow-hidden rounded-3xl sm:basis-[calc((100%_-_0.75rem)/2)] md:basis-[calc((100%_-_3rem)/3)] lg:basis-[calc((100%_-_4.5rem)/4)]";

const IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 72vw";

function SoonBadge() {
    return (
        <Badge className="absolute start-2.5 top-2.5 z-10 rounded-full border-0 bg-c2-neutral-420 px-6 py-1 text-base font-bold text-white">
            {SOON_LABEL}
        </Badge>
    );
}

function ContentToolItem({ card }: { card: ComingSoonCard }) {
    const Icon = card.icon;
    return (
        <article className={cn(CARD_CLASS, "border border-c2-neutral-200 bg-white")}>
            <div className="relative bg-c2-navy-50">
                <LandingImage asset={card.image} sizes={IMAGE_SIZES} className="w-full rounded-none border-0" />
                {card.soon ? <SoonBadge /> : null}
            </div>
            <div className="flex flex-1 items-start gap-3 p-4 md:p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-c2-navy-700-a10 p-2 text-c2-navy-700">
                    <Icon className="size-6" strokeWidth={2} />
                </span>
                <div className="flex min-w-0 flex-col">
                    <h3 className="mb-1 text-[12px] font-medium text-c2-neutral-950 md:text-lg">{card.title}</h3>
                    <p className="text-[12px] font-normal leading-relaxed text-c2-navy-560 md:text-sm">{card.description}</p>
                </div>
            </div>
        </article>
    );
}

/** The square image covers the whole 4:5 card, which crops its sides; the gradient spans it all. */
function CreativeToolItem({ card }: { card: CreativeToolCard }) {
    return (
        <article className={cn(CARD_CLASS, "relative aspect-[4/5]")}>
            <LandingImage
                asset={card.image}
                sizes={IMAGE_SIZES}
                className="absolute inset-0 size-full rounded-none border-0 object-cover"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: card.gradient }} />
            {card.soon ? <SoonBadge /> : null}
            <div className="absolute inset-x-0 bottom-0 px-4 pb-5">
                <h3 className="mb-2 text-base font-bold leading-snug text-c2-neutral-975">{card.title}</h3>
                <p className="text-sm font-normal leading-snug text-c2-neutral-975">{card.description}</p>
            </div>
        </article>
    );
}
