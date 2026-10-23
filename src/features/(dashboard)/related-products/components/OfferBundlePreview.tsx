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
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { formatPrice } from "@/src/lib/format-price";
import { cn } from "@/src/lib/utils";
import { getOfferPricing, parseOfferPrice, type BundleProduct } from "../offer-pricing";

/** Fallback step when no card has been measured yet — one card plus its gap. */
const FALLBACK_SCROLL_STEP = 152;

/**
 * `scrollWidth` and `clientWidth` are rounded to whole pixels while `scrollLeft`
 * is not, so an edge is "reached" a fraction short of the arithmetic.
 */
const EDGE_TOLERANCE = 2;

/**
 * A group caption's own height — the `text-sm` line box plus its `mb-2` — so
 * the totals can be pushed down by exactly what a caption adds above the box.
 */
const LABEL_HEIGHT = "1.75rem";

/**
 * The track's own metrics, in rem, mirroring the classes below: a `md:w-36`
 * card, the `w-4` plus sign between two cards, the `gap-2` between every pair
 * of children (the edge spacers included), and the frame's `md:px-3`. They
 * exist so the box can be capped at a card count instead of waiting for its
 * container to run out of room.
 *
 * They only govern the desktop row — on mobile the box takes the full width it
 * is given and is swiped instead.
 */
const CARD_REM = 9;
const PLUS_REM = 1;
const GAP_REM = 0.5;
const BOX_PADDING_REM = 0.75;


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
        // Between card and plus sign, plus one at each end before the spacers.
        (2 * visible - 2 + 2) * GAP_REM +
        2 * BOX_PADDING_REM;

    return `calc(${rem}rem + 2px)`;
}

/**
 * `default` is the framed equation; `compact` drops the dashed frame, narrows
 * the cards to 100px, outlines each one instead, moves the arrows out beside
 * the track and stacks the totals. Being borderless, it is also uncapped — the
 * track takes whatever width the row has left, so `visibleCount` is ignored.
 */
export type BundleVariant = "default" | "compact";

export type { BundleProduct };

interface OfferBundlePreviewProps {
    /**
     * The product the offer hangs on. Required: its price is part of the
     * "before" total, so a preview without it would understate that total.
     */
    mainProduct: BundleProduct;
    /**
     * Leaves the main product's card out while still pricing it in — for a
     * host that shows that product right above, like the chat header.
     */
    showMainProduct?: boolean;
    relatedProducts: (BundleProduct | null | undefined)[];
    /**
     * The "before" total is deliberately not a prop: it is computed here, by
     * `getOfferPricing`, from the very products this preview renders.
     */
    offerPrice?: string | number | null;
    /**
     * Shown under the original price while `offerPrice` is still empty — for
     * the offer form, before the merchant has typed one. Without an offer price
     * the original one stands as the total instead of a struck-out "0 ₪".
     */
    missingPriceHint?: string;
    /** Adds a "وفّر ..." chip next to the total whenever the offer saves money. */
    showSavings?: boolean;
    /** Optional captions over each group — the help sample labels them with its steps instead. */
    mainLabel?: string;
    relatedLabel?: string;
    /** How many bundled cards the box shows before it starts sliding, from md up. */
    visibleCount?: number;
    /** Layout size. Defaults to the framed `default` one. */
    variant?: BundleVariant;
    /**
     * Drops the "= price" block — for the screens that price the offer
     * themselves, so the equation isn't spelled out twice.
     */
    showTotals?: boolean;
    /** Call to action, laid out on its own line under the prices. */
    action?: ReactNode;
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

/** Stretched over the whole card, so the photo and caption keep their own markup. */
function CardLink({ product }: { product: BundleProduct }) {
    if (!product.href) return null;

    return <Link href={product.href} aria-label={product.name} className="absolute inset-0" />;
}

function ProductCaption({ product, className }: { product: BundleProduct; className?: string }) {
    // Parsed exactly as the total parses it, so a card never prints a price
    // ("0 ₪", say) that the total treats as unknown.
    const price = parseOfferPrice(product.price);

    return (
        <figcaption className={className}>
            <p className="truncate text-[11px] leading-tight text-c2-neutral-500 md:text-xs">
                {product.name}
            </p>
            {price !== null && (
                <p className="mt-1 truncate text-xs leading-tight font-semibold text-c2-primary">
                    {formatPrice(price)} ₪
                </p>
            )}
        </figcaption>
    );
}

/**
 * Two cards fill the mobile track exactly: the width left over once the plus
 * sign (`w-4`), the two `gap-2`s around it and the `gap-2` before each edge
 * spacer are taken out, halved. Percentages resolve against the scroller's own
 * content box, so this holds at every phone width without a media query per size.
 */
const MOBILE_CARD_WIDTH = "w-[calc((100%_-_3rem)/2)]";

/** One bundled product inside the box: a photo over its name and price. */
function BundleCard({ product, variant }: { product: BundleProduct; variant: BundleVariant }) {
    const isCompact = variant === "compact";

    return (
        <figure
            data-bundle-card
            // The scroll margin matches the track's gap, so a card snaps with
            // that gap in view before it — the first one lands exactly on the
            // leading spacer's snap point at 0. The track's ends snap to the
            // spacers, see the scroller.
            className={cn(
                "relative flex shrink-0 snap-start flex-col overflow-hidden rounded-lg border bg-white",
                isCompact
                    ? "w-25 scroll-ms-1 border-c2-primary"
                    : cn("scroll-ms-2 border-c2-neutral-200 sm:w-32 md:w-36", MOBILE_CARD_WIDTH),
                product.href && !isCompact && "transition-colors hover:border-c2-primary"
            )}
        >
            <ProductPhoto product={product} className={isCompact ? "h-20 w-full" : "h-23 w-full"} />
            <ProductCaption
                product={product}
                className={isCompact ? "px-1.5 pt-1 pb-1.5" : "px-2 pt-1.5 pb-2"}
            />
            <CardLink product={product} />
        </figure>
    );
}

/**
 * The main product, which sits outside the bundle. It is a full-width row on
 * mobile — a column of one card there would waste the width and push the
 * bundle off the first screen — and a card from md up. In the default variant
 * that card carries no frame and its photo lines up with the dashed box's top
 * edge; in compact it matches the bundled cards' size, outlined in neutral so
 * it doesn't read as one of them.
 */
function MainProductCard({ product, variant }: { product: BundleProduct; variant: BundleVariant }) {
    const isCompact = variant === "compact";

    return (
        <figure
            className={cn(
                "relative flex w-full items-center gap-3 overflow-hidden rounded-lg md:flex-col md:items-stretch md:gap-0",
                isCompact ? "md:w-25 md:border md:border-c2-neutral-200 md:bg-white" : "md:w-36"
            )}
        >
            <ProductPhoto
                product={product}
                className={cn(
                    "size-16 rounded-lg md:w-full md:rounded-none",
                    isCompact ? "md:h-20" : MAIN_PHOTO_HEIGHT
                )}
            />
            <ProductCaption
                product={product}
                className={cn(
                    "min-w-0 flex-1 md:flex-none",
                    isCompact ? "md:px-1.5 md:pt-1 md:pb-1.5" : "md:px-2 md:pt-1.5 md:pb-2"
                )}
            />
            <CardLink product={product} />
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
    inline = false,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    side: "start" | "end";
    /** Sits beside the track as a flex item instead of floating over its edge. */
    inline?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "hidden size-7 shrink-0 items-center justify-center rounded-full bg-c2-primary text-white shadow-sm transition-opacity md:flex",
                disabled
                    ? "cursor-not-allowed opacity-30"
                    : "cursor-pointer opacity-100 hover:bg-c2-navy-600",
                !inline && [
                    "absolute top-1/2 -translate-y-1/2",
                    side === "start" ? "-inset-s-3" : "-inset-e-3",
                ]
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
    showMainProduct = true,
    relatedProducts: relatedProductsInput,
    offerPrice: offerPriceInput,
    missingPriceHint,
    showSavings = false,
    mainLabel,
    relatedLabel,
    visibleCount = 3,
    variant = "default",
    showTotals = true,
    action,
    className,
}: OfferBundlePreviewProps) {
    const { relatedProducts, originalPrice, offerPrice, savings } = getOfferPricing(
        mainProduct,
        relatedProductsInput,
        offerPriceInput
    );
    // The "before" price is only struck out when there really is a saving: an
    // unknown total, or one at or below the offer (a product got cheaper after
    // the offer was set), must never be shown as the price it replaced.
    const showOriginal = savings !== null;
    // Before an offer price exists the original total stands in as the price.
    const headlinePrice = offerPrice ?? originalPrice;
    const hasLabels = Boolean(mainLabel || relatedLabel);
    const isCompact = variant === "compact";

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
        // Scrolling to an absolute offset, not by a delta: a step back from the
        // second card has to land on 0 exactly, or snapping can leave the track
        // a pixel short of its start and the arrow never reports itself done.
        const target = Math.max(0, Math.abs(scroller.scrollLeft) + steps * cardStep(scroller));
        scroller.scrollTo({ left: sign * target, behavior: "smooth" });
    };

    return (
        <div
            style={{ "--bundle-label-height": LABEL_HEIGHT } as CSSProperties}
            className={cn(
                "flex w-full max-w-full min-w-0 flex-col gap-3 md:flex-row md:items-stretch md:justify-center",
                // Compact keeps every gap tight so the cards get the width.
                isCompact ? "md:gap-2" : "md:gap-6",
                className
            )}
        >
            {/* Sized to its content rather than stretched over the row: a
                stretched group left the box wider than its cards, or a gap
                between the box and the "=", whenever the row had room to spare.
                min-w-0 so the bundle box, not the page, absorbs any shortfall. */}
            <div
                className={cn(
                    "flex min-w-0 flex-col gap-3 md:flex-initial md:flex-row md:items-stretch",
                    isCompact ? "md:gap-2" : "md:gap-6"
                )}
            >
                {/* The offer prices the main product together with the bundled
                    ones, so a "+" joins it to the box like any other term. */}
                {showMainProduct && (
                    <>
                        <div className="flex min-w-0 flex-col md:shrink-0">
                            {mainLabel && <GroupLabel>{mainLabel}</GroupLabel>}
                            {/* Top-aligned: both labels are the same height, so the photo
                                below starts level with the dashed box's own top edge. */}
                            <MainProductCard product={mainProduct} variant={variant} />
                        </div>

                        <span
                            aria-hidden="true"
                            className={cn(
                                "shrink-0 self-center font-bold text-c2-primary",
                                isCompact ? "text-base" : "text-xl",
                                // Centred on the box, not on the box plus its caption.
                                hasLabels && "md:mt-(--bundle-label-height)"
                            )}
                        >
                            +
                        </span>
                    </>
                )}

                {/* Capped at `visibleCount` cards from md up, so the fourth product
                    slides even when the row has space to spare. */}
                <div
                    style={{ "--bundle-track": trackWidth(visibleCount) } as CSSProperties}
                    className={cn(
                        "flex min-w-0 flex-col md:flex-1",
                        // Compact is uncapped: inside a card the leftover width
                        // belongs to the track, not to the row's trailing edge.
                        !isCompact && "md:max-w-(--bundle-track)"
                    )}
                >
                    {relatedLabel && <GroupLabel>{relatedLabel}</GroupLabel>}

                    {/* Compact lays the arrows beside the track as flex items;
                        the framed variant floats them over the box's edges. */}
                    <div
                        className={cn(
                            "relative min-w-0 flex-1",
                            isCompact && "flex items-center gap-1"
                        )}
                    >
                        {isCompact && isScrollable && (
                            <SliderArrow
                                inline
                                side="start"
                                label="السابق"
                                disabled={atStart}
                                onClick={() => scrollByCards(-1)}
                            >
                                <ChevronRight className="size-4" />
                            </SliderArrow>
                        )}

                        {/* The outer inset is the frame's padding plus the gap
                            before each edge spacer inside the scroller. Never a
                            margin on the outer cards: a card's own margin shifts
                            its snap position, and the track then rests a few
                            pixels past its start for good. */}
                        <div
                            className={cn(
                                "h-full rounded-xl",
                                isCompact
                                    ? "min-w-0 flex-1"
                                    : "border border-dashed border-c2-primary px-2 py-3 md:px-3"
                            )}
                        >
                            <div
                                ref={scrollerRef}
                                onScroll={syncScroll}
                                className={cn(
                                    "flex h-full snap-x snap-mandatory items-center overflow-x-auto no-scrollbar",
                                    // Every pixel between two cards is a pixel
                                    // the next card can't use, and compact has
                                    // none to give away.
                                    isCompact ? "gap-1" : "gap-2"
                                )}
                            >
                                {/* Zero-width edge spacers: the gap beside each
                                    keeps the outer cards a few pixels inside the
                                    scroller's clip edge. Flush against it, the
                                    last card lost its end border whenever the
                                    track stopped a fraction of a pixel short of
                                    its true end. They are also the track's exact
                                    start and end snap points, so it always comes
                                    to rest at 0 and at the real scroll end. (A
                                    scroller's own inline-end padding is no
                                    substitute: it collapses once the content
                                    overflows.) */}
                                <span aria-hidden="true" className="w-0 shrink-0 snap-start self-stretch" />
                                {relatedProducts.map((product, index) => (
                                    <Fragment key={product.id ?? product.name}>
                                        {index > 0 && (
                                            <span
                                                className={cn(
                                                    "shrink-0 self-center text-center font-bold text-c2-primary",
                                                    isCompact ? "w-2.5 text-sm" : "w-4 text-lg"
                                                )}
                                            >
                                                +
                                            </span>
                                        )}
                                        <BundleCard product={product} variant={variant} />
                                    </Fragment>
                                ))}
                                <span aria-hidden="true" className="w-0 shrink-0 snap-end self-stretch" />
                            </div>
                        </div>

                        {/* Touch screens swipe the box directly, so the arrows would
                            only cover a card there. */}
                        {isScrollable && (
                            <>
                                {!isCompact && (
                                    <SliderArrow
                                        side="start"
                                        label="السابق"
                                        disabled={atStart}
                                        onClick={() => scrollByCards(-1)}
                                    >
                                        <ChevronRight className="size-4" />
                                    </SliderArrow>
                                )}
                                <SliderArrow
                                    inline={isCompact}
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

            {showTotals && (
            <div
                className={cn(
                    // The bundle group is the one that gives up width on the
                    // row; the prices keep theirs.
                    "flex min-w-0 shrink flex-wrap items-center justify-center gap-x-3 gap-y-1 md:shrink-0",
                    // The totals sit level with the box itself, not with the
                    // column that carries a caption above it — otherwise the "="
                    // lands half a caption higher than the slider arrows.
                    hasLabels && "md:mt-(--bundle-label-height)"
                )}
            >
                <span className="text-xl font-bold text-c2-primary">=</span>

                {/* The action stacks under the prices themselves, not under the
                    whole equation — centred on the "=" it would read as pushed
                    off to one side. Nesting it in a column also keeps it out of
                    the intrinsic width: a wrapping flex row is as wide as all of
                    its children laid end to end, so a button beside the prices
                    would claim width the track is the one paying for. */}
                <div className="flex min-w-0 flex-col items-center gap-2">
                    {/* Compact stacks the two prices with a "بدلاً من" between
                        them; the default variant keeps them side by side. */}
                    <div
                        className={cn(
                            "flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1",
                            isCompact && "flex-col gap-x-0 gap-y-0.5"
                        )}
                    >
                        <span className="text-xl font-bold whitespace-nowrap text-c2-navy-900 md:text-2xl">
                            {headlinePrice !== null ? `${formatPrice(headlinePrice)} ₪` : "—"}
                        </span>
                        {offerPrice !== null ? (
                            showOriginal && (
                                <>
                                    {isCompact && (
                                        <span className="text-xs whitespace-nowrap text-c2-neutral-500">
                                            بدلاً من
                                        </span>
                                    )}
                                    <span className="text-sm whitespace-nowrap text-c2-danger line-through">
                                        {formatPrice(originalPrice)} ₪
                                    </span>
                                </>
                            )
                        ) : (
                            missingPriceHint && (
                                <span className="max-w-40 text-center text-xs text-c2-neutral-500">
                                    {missingPriceHint}
                                </span>
                            )
                        )}
                        {showSavings && savings !== null && (
                            <span className="text-xs font-semibold whitespace-nowrap text-c2-danger">
                                وفّر {formatPrice(savings)} ₪
                            </span>
                        )}
                    </div>

                    {action}
                </div>
            </div>
            )}
        </div>
    );
}
