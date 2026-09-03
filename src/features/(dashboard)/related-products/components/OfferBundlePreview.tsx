// src/features/(dashboard)/related-products/components/OfferBundlePreview.tsx
"use client";

import {
    Fragment,
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { formatPrice } from "@/src/lib/format-price";
import { cn } from "@/src/lib/utils";

/** Fallback step when no card has been measured yet — one card plus its gap. */
const FALLBACK_SCROLL_STEP = 152;

/**
 * `scrollWidth` and `clientWidth` are rounded to whole pixels while `scrollLeft`
 * is not, so an edge is "reached" a fraction short of the arithmetic.
 */
const EDGE_TOLERANCE = 2;

/**
 * The track's own metrics, in rem, mirroring the classes below: a `md:w-36`
 * card, the `w-4` plus sign between two cards, the `gap-2` between every pair
 * of children, and the frame's `md:px-5`. They exist so the box can be capped
 * at a card count instead of waiting for its container to run out of room.
 *
 * They only govern the desktop row — on mobile the box takes the full width it
 * is given and is swiped instead.
 */
const CARD_REM = 9;
const PLUS_REM = 1;
const GAP_REM = 0.5;
const BOX_PADDING_REM = 1.25;

/**
 * The bundled photos are 92px (`h-23`). On the desktop row the main product
 * sits outside the box, so its photo starts at the dashed border itself and is
 * taller by exactly what the box adds above a bundled photo — its 1px border
 * plus the `py-3` padding.
 */
const MAIN_PHOTO_HEIGHT = "md:h-[calc(5.75rem_+_13px)]";

/**
 * How far one card sits from the next. Measuring it covers the plus sign and
 * both gaps at whatever size the current breakpoint gave them.
 */
function cardStep(scroller: HTMLElement): number {
    const cards = scroller.querySelectorAll<HTMLElement>("[data-bundle-card]");
    if (cards.length < 2) return FALLBACK_SCROLL_STEP;

    return Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) || FALLBACK_SCROLL_STEP;
}

/** Width of a track showing exactly `visible` cards, borders included. */
function trackWidth(visible: number): string {
    const rem =
        visible * CARD_REM +
        (visible - 1) * PLUS_REM +
        (2 * visible - 2) * GAP_REM +
        2 * BOX_PADDING_REM;

    return `calc(${rem}rem + 2px)`;
}

export interface BundleProduct {
    id?: number | string;
    name: string;
    price?: string | number | null;
    imageUrl?: string | null;
}

interface OfferBundlePreviewProps {
    mainProduct: BundleProduct;
    relatedProducts: BundleProduct[];
    originalPrice?: string | number | null;
    offerPrice?: string | number | null;
    /** Optional captions over each group — the help sample labels them with its steps instead. */
    mainLabel?: string;
    relatedLabel?: string;
    /** How many bundled cards the box shows before it starts sliding, from md up. */
    visibleCount?: number;
    className?: string;
}

function ProductPhoto({ product, className }: { product: BundleProduct; className?: string }) {
    return (
        <div className={cn("relative shrink-0 overflow-hidden bg-white", className)}>
            {product.imageUrl ? (
                <VideoOrImage
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    thumb
                    className="object-contain"
                />
            ) : (
                <div className="flex h-full items-center justify-center">
                    <ImageOff className="size-5 text-c2-neutral-500" />
                </div>
            )}
        </div>
    );
}

function ProductCaption({ product, className }: { product: BundleProduct; className?: string }) {
    return (
        <figcaption className={className}>
            <p className="truncate text-[11px] leading-tight text-c2-neutral-500 md:text-xs">
                {product.name}
            </p>
            {product.price != null && product.price !== "" && (
                <p className="mt-1 truncate text-xs leading-tight font-semibold text-c2-primary">
                    {formatPrice(product.price)} ₪
                </p>
            )}
        </figcaption>
    );
}

/**
 * Two cards fill the mobile track exactly: the width left over once the plus
 * sign (`w-4`) and the two `gap-2`s around it are taken out, halved. Percentages
 * resolve against the scroller's own content box, so this holds at every phone
 * width without a media query per size.
 */
const MOBILE_CARD_WIDTH = "w-[calc((100%_-_2rem)/2)]";

/** One bundled product inside the dashed box: a 92px photo over its name and price. */
function BundleCard({ product }: { product: BundleProduct }) {
    return (
        <figure
            data-bundle-card
            // The last card snaps by its end edge: snapping every card by its
            // start leaves the final resting point short of the real scroll
            // end, so the track would never report itself as finished.
            className={cn(
                "flex shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-c2-neutral-200 bg-white last:snap-end sm:w-32 md:w-36",
                MOBILE_CARD_WIDTH
            )}
        >
            <ProductPhoto product={product} className="h-23 w-full" />
            <ProductCaption product={product} className="px-2 pt-1.5 pb-2" />
        </figure>
    );
}

/**
 * The main product, which sits outside the dashed box and carries no frame. It
 * is a full-width row on mobile — a column of one card there would waste the
 * width and push the bundle off the first screen — and the familiar card from
 * md up, where its photo lines up with the box's top edge.
 */
function MainProductCard({ product }: { product: BundleProduct }) {
    return (
        <figure className="flex w-full items-center gap-3 overflow-hidden rounded-lg md:w-36 md:flex-col md:items-stretch md:gap-0">
            <ProductPhoto
                product={product}
                className={cn("size-16 rounded-lg md:w-full md:rounded-none", MAIN_PHOTO_HEIGHT)}
            />
            <ProductCaption
                product={product}
                className="min-w-0 flex-1 md:flex-none md:px-2 md:pt-1.5 md:pb-2"
            />
        </figure>
    );
}

function GroupLabel({ children }: { children: string }) {
    return (
        <p className="mb-2 truncate text-sm font-medium text-c2-neutral-800 md:text-center">
            {children}
        </p>
    );
}

/** Round arrow over the dashed box — greyed out once the track can't go further. */
function SliderArrow({
    label,
    disabled,
    onClick,
    side,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    side: "start" | "end";
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "absolute top-1/2 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full bg-c2-primary text-white shadow-sm transition-opacity md:flex",
                disabled
                    ? "cursor-not-allowed opacity-30"
                    : "cursor-pointer opacity-100 hover:bg-c2-navy-600",
                side === "start" ? "-inset-s-3" : "-inset-e-3"
            )}
        >
            {children}
        </button>
    );
}

/**
 * The offer as the customer sees it, laid out as the equation it is.
 *
 * From md up that equation runs across one row: main product + dashed bundle
 * box = discounted total. Below md it stacks — the main product as a wide row,
 * the bundle box full-width underneath, the total last — with the `+` and `=`
 * kept as the separators so it still reads the same way.
 *
 * Nothing here may widen its container: the box is capped at `visibleCount`
 * cards on the desktop row and scrolls past that (arrows on pointer devices,
 * swiping on touch), and the totals wrap rather than push.
 */
export function OfferBundlePreview({
    mainProduct,
    relatedProducts,
    originalPrice,
    offerPrice,
    mainLabel,
    relatedLabel,
    visibleCount = 3,
    className,
}: OfferBundlePreviewProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [isScrollable, setIsScrollable] = useState(false);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // Arrows appear only when the bundle actually overflows its box, which
    // depends on the container it is dropped into as much as on the count.
    const syncScroll = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const distance = scroller.scrollWidth - scroller.clientWidth;
        // scrollLeft counts down from 0 in RTL, so compare travelled distance.
        const travelled = Math.abs(scroller.scrollLeft);
        const step = cardStep(scroller);

        setIsScrollable(distance > EDGE_TOLERANCE);
        setAtStart(travelled <= EDGE_TOLERANCE);
        setAtEnd(distance - travelled <= EDGE_TOLERANCE);
        setActiveIndex(Math.round(travelled / step));
    }, []);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        syncScroll();
        const observer = new ResizeObserver(syncScroll);
        // Watching the cards too, so late-loading images can't leave a stale answer.
        observer.observe(scroller);
        for (const card of scroller.children) observer.observe(card);
        return () => observer.disconnect();
    }, [relatedProducts.length, syncScroll]);

    /** Moves `steps` cards along the track — positive forward, negative back. */
    const scrollByCards = (steps: number) => {
        const scroller = scrollerRef.current;
        if (!scroller || steps === 0) return;

        // scrollLeft runs the other way in RTL, so ask the box which way it reads.
        const sign = getComputedStyle(scroller).direction === "rtl" ? -1 : 1;
        scroller.scrollBy({ left: sign * steps * cardStep(scroller), behavior: "smooth" });
    };

    return (
        <div
            className={cn(
                "flex w-full max-w-full min-w-0 flex-col gap-3 md:flex-row md:items-stretch md:gap-6",
                className
            )}
        >
            {/* min-w-0 so the bundle box, not the page, absorbs any shortfall. */}
            <div className="flex min-w-0 flex-col gap-3 md:flex-1 md:flex-row md:items-stretch md:gap-6">
                <div className="flex min-w-0 flex-col md:shrink-0">
                    {mainLabel && <GroupLabel>{mainLabel}</GroupLabel>}
                    {/* Top-aligned: both labels are the same height, so the photo
                        below starts level with the dashed box's own top edge. */}
                    <MainProductCard product={mainProduct} />
                </div>

                {/* No "+" joins the main product to the box: the offer prices the
                    bundled products only, the main one is just the anchor. */}

                {/* Capped at `visibleCount` cards from md up, so the fourth product
                    slides even when the row has space to spare. */}
                <div
                    style={{ "--bundle-track": trackWidth(visibleCount) } as CSSProperties}
                    className="flex min-w-0 flex-col md:max-w-(--bundle-track) md:flex-1"
                >
                    {relatedLabel && <GroupLabel>{relatedLabel}</GroupLabel>}

                    <div className="relative min-w-0 flex-1">
                        {/* The padding lives on the frame, not on the scroller: a
                            scroller's own inline-end padding collapses once the
                            content overflows, which left the last card flush
                            against the border. Inset like this both sides hold. */}
                        <div className="h-full rounded-xl border border-dashed border-c2-primary px-4 py-3 md:px-5">
                            <div
                                ref={scrollerRef}
                                onScroll={syncScroll}
                                className="flex h-full snap-x snap-mandatory items-center gap-2 overflow-x-auto no-scrollbar"
                            >
                                {relatedProducts.map((product, index) => (
                                    <Fragment key={product.id ?? product.name}>
                                        {index > 0 && (
                                            <span className="w-4 shrink-0 self-center text-center text-lg font-bold text-c2-primary">
                                                +
                                            </span>
                                        )}
                                        <BundleCard product={product} />
                                    </Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Touch screens swipe the box directly, so the arrows would
                            only cover a card there. */}
                        {isScrollable && (
                            <>
                                <SliderArrow
                                    side="start"
                                    label="السابق"
                                    disabled={atStart}
                                    onClick={() => scrollByCards(-1)}
                                >
                                    <ChevronRight className="size-4" />
                                </SliderArrow>
                                <SliderArrow
                                    side="end"
                                    label="التالي"
                                    disabled={atEnd}
                                    onClick={() => scrollByCards(1)}
                                >
                                    <ChevronLeft className="size-4" />
                                </SliderArrow>
                            </>
                        )}
                    </div>

                    {/* Two cards fill the mobile track exactly, so there is no
                        half-visible third card hinting that it scrolls — the dots
                        carry that job, and double as a jump target. */}
                    {isScrollable && (
                        <div className="mt-2.5 flex items-center justify-center gap-1.5 md:hidden">
                            {relatedProducts.map((product, index) => (
                                <button
                                    key={product.id ?? product.name}
                                    type="button"
                                    aria-label={`المنتج ${index + 1}`}
                                    aria-current={index === activeIndex}
                                    onClick={() => scrollByCards(index - activeIndex)}
                                    className={cn(
                                        "h-1.5 cursor-pointer rounded-full transition-all",
                                        index === activeIndex
                                            ? "w-4 bg-c2-primary"
                                            : "w-1.5 bg-c2-neutral-200"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Wrapping, not nowrap: when the row runs short the struck-through
                price drops under the offer price instead of off the dialog. */}
            <div className="flex min-w-0 shrink flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span className="text-xl font-bold text-c2-primary">=</span>
                <span className="text-xl font-bold whitespace-nowrap text-c2-navy-900 md:text-2xl">
                    {formatPrice(offerPrice)} ₪
                </span>
                <span className="text-sm whitespace-nowrap text-c2-danger line-through">
                    {formatPrice(originalPrice)} ₪
                </span>
            </div>
        </div>
    );
}
