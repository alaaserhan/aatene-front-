"use client";

import {
  MediaGallery,
  type MediaItem,
} from "@/src/components/shared/MediaGallery";
import StoreInfoCard from "@/src/components/shared/StoreInfoCard";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { Price } from "@/src/components/ui/Price";
import { RatingStars } from "@/src/components/ui/RatingStars";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ShareModal } from "@/src/components/ui/ShareModal";
import {
  useAddProductToCompare,
  useRemoveProductFromCompare,
} from "@/src/features/(web)/compares/hooks";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { cn, isVideoFile, sanitizeMediaUrl } from "@/src/lib/utils";
import Cookies from "js-cookie";
import {
  Flag,
  MoreVertical,
  Phone,
  Send,
  Share2,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ReportAbuseModal } from "../../reports/components/ReportAbuseModal";
import MobileCollapsibleSection from "./MobileCollapsibleSection";
import { Attribute, AttributeOption, Product, Store } from "../api";
import { ChatNowButton } from "@/src/components/shared/ChatNowButton";
import type { ChatTarget } from "@/src/lib/chat-links";
import { getAttributePlaceholder } from "@/src/lib/attribute-placeholder";
import { maskPhone } from "@/src/lib/phone";
import { StorePhoneDialog } from "@/src/features/(web)/stores/components/StorePhoneDialog";

const PRODUCT_CONDITION_LABELS: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
};

const PLACEHOLDER_SRC = "/images/placeholders/product-placeholder.svg";

interface ProductHeroProps {
  product: Product;
  store: Store;
  attributes: Attribute[];
  /** Shipping card, rendered under the actions and above the store card. */
  shipping?: ReactNode;
  /** Bundle offer card, rendered as the second card of the details column. */
  crossSells?: ReactNode;
}

export default function ProductHero({
  product,
  store,
  attributes,
  shipping,
  crossSells,
}: ProductHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({});
  const [isFavorite, setIsFavorite] = useState(product.is_favorite);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isInCompare, setIsInCompare] = useState(product.in_compare);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { mutate: addToCompare } = useAddProductToCompare();
  const { mutate: removeFromCompare } = useRemoveProductFromCompare();

  useEffect(() => {
    setIsFavorite(product.is_favorite);
  }, [product.is_favorite]);

  const selectedVariation = useMemo(() => {
    if (!product.variations || product.variations.length === 0) return null;
    if (
      !attributes ||
      Object.keys(selectedVariations).length !== attributes.length
    )
      return null;

    return product.variations.find((v) => {
      const options = v.attribute_options || v.attributeOptions;
      if (!options) return false;
      return options.every((opt) => {
        const selectedVal = selectedVariations[String(opt.attribute_id)];
        return selectedVal && selectedVal === String(opt.option_id);
      });
    });
  }, [product.variations, selectedVariations, attributes]);

  const allMedia = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];
    const seen = new Set<string>();

    const addMedia = (source: string | null | undefined) => {
      const url = sanitizeMediaUrl(source);
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({ type: isVideoFile(url) ? "video" : "image", url });
    };

    addMedia(product.cover);
    product.gallery?.forEach(addMedia);
    addMedia(product.video);
    product.variations?.forEach((v) => addMedia(v.image));

    return items;
  }, [product.cover, product.gallery, product.video, product.variations]);

  // Keep the selection valid when the media list shrinks between renders.
  const activeIndex = Math.min(selectedIndex, Math.max(allMedia.length - 1, 0));

  const currentStoreId = Cookies.get("current_store_id");
  const isProductOwner =
    !!currentStoreId &&
    !!product.store_id &&
    Number(currentStoreId) === product.store_id;

  const rating = parseFloat(product.review_rate || "0");
  const reviewCount = parseInt(product.review_count || "0");

  const hasDiscount =
    !selectedVariation &&
    product.price_after_discount &&
    product.price_after_discount !== product.price;
  const displayPrice = selectedVariation
    ? String(selectedVariation.price)
    : product.price_after_discount || product.price;
  const shouldAskForPrice = shouldShowAskForPrice(
    product.ask_for_price,
    displayPrice,
  );
  const discountPercent = product.discount_present ?? 0;

  const conditionLabel =
    PRODUCT_CONDITION_LABELS[product.condition] ?? product.condition;
  const storePhone = normalizeDisplayPhone(store.phone);
  const hasOptions = Boolean(
    (product.condition && conditionLabel) || attributes?.length,
  );

  const chatTarget = (askPrice = false): ChatTarget => ({
    type: "store",
    id: store.id,
    productId: product.id,
    askPrice,
  });


  const toggleCompare = () => {
    const mutate = isInCompare ? removeFromCompare : addToCompare;
    mutate(product.id);
    setIsInCompare(!isInCompare);
  };

  // Jump the gallery to the picked variation's image once a full set is chosen.
  useEffect(() => {
    if (!selectedVariation?.image) return;
    const sanitized = sanitizeMediaUrl(selectedVariation.image);
    const index = allMedia.findIndex((item) => item.url === sanitized);
    if (index !== -1) setSelectedIndex(index);
  }, [selectedVariation?.image, allMedia]);

  return (
    <section>
      <Breadcrumb
        items={[
          { label: "قائمة المنتجات", href: "/search?type=products" },
          { label: product.name },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <MediaGallery
          items={allMedia}
          title={product.name}
          activeIndex={activeIndex}
          onSelect={setSelectedIndex}
          onOpen={() => setIsPreviewOpen(true)}
          fallbackSrc={PLACEHOLDER_SRC}
          className="lg:w-[55%] lg:self-start"
        />

        {/* Details — min-w-0 so the bundle card's slider can shrink here. */}
        <div className="flex-1 min-w-0">
          <div className="white-card mb-6">
            {/* Order (RTL): price, old price, discount pill, offer countdown. */}
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {shouldAskForPrice ? (
                <ChatNowButton
                  size="md"
                  className="text-base"
                  target={chatTarget(true)}
                  label="اطلب السعر"
                  icon={null}
                />
              ) : (
                <>
                  <Price value={displayPrice} className="text-c2-primary" />

                  {hasDiscount && (
                    <span className="text-sm text-c2-danger line-through">
                      {formatPrice(product.price)} ₪
                    </span>
                  )}

                  {hasDiscount && discountPercent > 0 && (
                    <span
                      dir="ltr"
                      className="rounded-full bg-c2-danger px-3 py-1 text-sm font-medium text-white"
                    >
                      {discountPercent}% off
                    </span>
                  )}

                  {hasDiscount && product.end_date && (
                    <OfferCountdown
                      endDate={product.end_date}
                      className="ms-4"
                    />
                  )}
                </>
              )}
            </div>

            <RatingStars
              className="mb-4"
              rating={rating}
              count={reviewCount}
              size="md"
            />

            <div className="flex items-start justify-between gap-3">
              <h1 className="heading-1 text-c2-neutral-800">{product.name}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteButton
                  id={product.id}
                  type="product"
                  isFavorite={isFavorite}
                  onSuccess={() => setIsFavorite((prev) => !prev)}
                  iconClassName="size-7"
                />
                <ProductActionsMenu
                  isProductOwner={isProductOwner}
                  onShare={() => setIsShareOpen(true)}
                  onReport={() => setIsReportOpen(true)}
                />
              </div>
            </div>
          </div>

          {crossSells}

          {hasOptions && (
            <div className="flex flex-col gap-3 white-card mb-6">
              {product.condition && conditionLabel && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-c2-navy-1000">
                    الحالة :
                  </span>
                  <span className="inline-flex items-center rounded-full bg-c2-neutral-200 px-3 py-1 text-sm text-c2-neutral-700">
                    {conditionLabel}
                  </span>
                </div>
              )}

              {attributes?.map((attr) => (
                <ReusableDropdown
                  key={attr.id}
                  placeholder={getAttributePlaceholder(attr.title)}
                  options={
                    attr.options?.map((option: AttributeOption) => ({
                      value: option.id.toString(),
                      label: option.title,
                    })) || []
                  }
                  value={selectedVariations[attr.id] || ""}
                  onChange={(val) =>
                    setSelectedVariations((prev) => ({
                      ...prev,
                      [attr.id]: val,
                    }))
                  }
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {storePhone && (
              <button
                type="button"
                onClick={() => setIsPhoneDialogOpen(true)}
                className="flex items-center justify-center gap-2 bg-blue-3 text-white h-11 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span dir="ltr">{maskPhone(storePhone)}</span>
                <Phone className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            <ChatNowButton
              unstyled
              target={chatTarget()}
              icon={<Send className="w-5 h-5" aria-hidden="true" />}
              iconPosition="end"
              iconClassName="w-5 h-5"
              className="flex items-center justify-center gap-2 bg-white border border-blue-3 text-blue-3 h-11 cursor-pointer rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            />

            <button
              type="button"
              onClick={toggleCompare}
              className={cn(
                "text-sm font-medium underline underline-offset-4 cursor-pointer",
                isInCompare ? "text-c2-danger" : "text-c2-navy-500",
              )}
            >
              {isInCompare ? "إزالة من المقارنة" : "أضف الى المقارنة"}
            </button>
          </div>

          <MobileCollapsibleSection title="تفاصيل الشحن">
            {shipping}
          </MobileCollapsibleSection>

          <MobileCollapsibleSection title="معلومات عن البائع">
            <StoreInfoCard
              store={store}
              hideReport={isProductOwner}
              className="mt-6 max-md:mt-4 max-md:rounded-none max-md:border-0 max-md:p-0 max-md:shadow-none"
            />
          </MobileCollapsibleSection>
        </div>
      </div>

      <MediaViewer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        media={allMedia.map((item) => item.url)}
        initialIndex={activeIndex}
      />

      <ReportAbuseModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        type="product"
        id={product.id}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={typeof window !== "undefined" ? window.location.href : ""}
        title={product.name}
        description="قم بمشاركة هذا المنتج مع أصدقائك"
      />

      {storePhone && (
        <StorePhoneDialog
          phone={storePhone}
          open={isPhoneDialogOpen}
          onOpenChange={setIsPhoneDialogOpen}
        />
      )}
    </section>
  );
}

/** Days : hours : minutes left on the discount; hidden once it has expired. */
function OfferCountdown({
  endDate,
  className,
}: {
  endDate: string;
  className?: string;
}) {
  // Computed only on the client so the server render can't mismatch the clock.
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(endDate).getTime();
    if (Number.isNaN(target)) return;

    const tick = () => setMsLeft(target - Date.now());
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (msLeft === null || msLeft <= 0) return null;

  const totalMinutes = Math.floor(msLeft / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <span
      className={cn(
        "rounded-full bg-c2-navy-50 px-6 py-1 text-sm text-c2-navy-700",
        className,
      )}
    >
      {days} يوم : {pad(hours)} : {pad(minutes)}
    </span>
  );
}



function ProductActionsMenu({
  isProductOwner,
  onShare,
  onReport,
}: {
  isProductOwner: boolean;
  onShare: () => void;
  onReport: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const runAndClose = (action: () => void) => () => {
    action();
    setIsOpen(false);
  };

  const itemClassName =
    "flex cursor-pointer items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="خيارات المنتج"
        className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-7 h-7 text-c2-primary" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40 z-30"
        >
          <button
            type="button"
            role="menuitem"
            onClick={runAndClose(onShare)}
            className={itemClassName}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            مشاركة المنتج
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isProductOwner}
            onClick={runAndClose(onReport)}
            className={cn(
              itemClassName,
              isProductOwner && "cursor-not-allowed opacity-60 hover:bg-white",
            )}
          >
            <Flag className="w-4 h-4" aria-hidden="true" />
            ابلاغ عن المنتج
          </button>
        </div>
      )}
    </div>
  );
}

function normalizeDisplayPhone(phone: unknown): string {
  if (phone == null) return "";
  const value = String(phone).trim();
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return "";
  return value;
}
