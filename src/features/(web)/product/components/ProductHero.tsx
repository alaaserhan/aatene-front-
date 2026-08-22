"use client";

import StoreInfoCard from "@/src/components/shared/StoreInfoCard";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { Price } from "@/src/components/ui/Price";
import { RatingStars } from "@/src/components/ui/RatingStars";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { VideoOrImageNext } from "@/src/components/ui/VideoOrImageNext";
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
  ChevronLeft,
  ChevronRight,
  Flag,
  MoreVertical,
  Phone,
  Play,
  Send,
  Share2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ReportAbuseModal } from "../../reports/components/ReportAbuseModal";
import { Attribute, AttributeOption, Product, Store } from "../api";
import { useAuthStore } from "@/src/stores/auth-store";
import { loginUrlWithAuthRequired } from "@/src/auth/links";

const PRODUCT_CONDITION_LABELS: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
};

const PLACEHOLDER_SRC = "/images/placeholders/product-placeholder.svg";

type MediaItem = { type: "image" | "video"; url: string };

interface ProductHeroProps {
  product: Product;
  store: Store;
  attributes: Attribute[];
  /** Shipping card, rendered under the actions and above the store card. */
  shipping?: ReactNode;
}

export default function ProductHero({
  product,
  store,
  attributes,
  shipping,
}: ProductHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({});
  const [isFavorite, setIsFavorite] = useState(product.is_favorite);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isInCompare, setIsInCompare] = useState(product.in_compare);

  const router = useRouter();
  const params = useParams();
  const lang = params?.locale || params?.lang || "ar";
  const { user } = useAuthStore();
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
  const currentMedia = allMedia[activeIndex];
  const hasGallery = allMedia.length > 1;

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

  const requireAuth = () => {
    if (user) return true;
    router.push(loginUrlWithAuthRequired(lang));
    return false;
  };

  const goToChat = (askPrice = false) => {
    if (!requireAuth()) return;
    const query = new URLSearchParams({
      type: "store",
      id: String(store.id),
      productId: String(product.id),
      ...(askPrice ? { askPrice: "1" } : {}),
    });
    router.push(`/${lang}/chat?${query.toString()}`);
  };

  const showPrev = () =>
    setSelectedIndex(activeIndex > 0 ? activeIndex - 1 : allMedia.length - 1);

  const showNext = () =>
    setSelectedIndex(activeIndex < allMedia.length - 1 ? activeIndex + 1 : 0);

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
        <div className="flex flex-col-reverse lg:flex-row gap-3 lg:w-[55%] lg:items-start">
          {hasGallery && (
            <ul
              className={cn(
                "flex shrink-0 gap-2.5 list-none",
                "flex-row h-[100px] w-full overflow-x-auto overflow-y-hidden",
                "lg:flex-col lg:h-auto lg:max-h-[600px] lg:w-[100px]",
                "lg:overflow-x-hidden lg:overflow-y-auto",
              )}
            >
              {allMedia.map((item, index) => (
                <li key={item.url}>
                  <MediaThumbnail
                    item={item}
                    index={index}
                    title={product.name}
                    isActive={activeIndex === index}
                    onSelect={() => setSelectedIndex(index)}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
            <VideoOrImageNext
              src={currentMedia?.url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              fallbackSrc={PLACEHOLDER_SRC}
              videoProps={{ controls: true }}
            />

            {hasGallery && (
              <>
                <GalleryArrow
                  side="right"
                  label="الصورة التالية"
                  onClick={showNext}
                />
                <GalleryArrow
                  side="left"
                  label="الصورة السابقة"
                  onClick={showPrev}
                />
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="white-card mb-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {shouldAskForPrice ? (
                <Button
                  size="md"
                  className="text-base"
                  onClick={() => goToChat(true)}
                >
                  اطلب السعر
                </Button>
              ) : (
                <>
                  {hasDiscount && discountPercent > 0 && (
                    <span className="rounded-full bg-c2-danger px-4 py-1.5 text-xs font-medium text-white">
                      عرض محدود
                    </span>
                  )}

                  <Price value={displayPrice} className="text-primary" />

                  {hasDiscount && (
                    <span className="text-sm text-c2-danger line-through">
                      {formatPrice(product.price)} ₪
                    </span>
                  )}

                  {hasDiscount && discountPercent > 0 && (
                    <span className="rounded-full bg-c2-success/20 px-3 py-1 text-xs font-medium text-c2-success">
                      {discountPercent}% off
                    </span>
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
                  placeholder={`اختر ${attr.title}`}
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
              <a
                href={`tel:${storePhone}`}
                onClick={(e) => {
                  if (isPhoneRevealed) return;
                  e.preventDefault();
                  setIsPhoneRevealed(true);
                }}
                className="flex items-center justify-center gap-2 bg-blue-3 text-white h-11 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                <span dir="ltr">
                  {isPhoneRevealed ? storePhone : maskDisplayPhone(storePhone)}
                </span>
                <Phone className="w-5 h-5" aria-hidden="true" />
              </a>
            )}

            <button
              type="button"
              onClick={() => goToChat()}
              className="flex items-center justify-center gap-2 bg-white border border-blue-3 text-blue-3 h-11 cursor-pointer rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              دردش
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>

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

          {shipping}

          <StoreInfoCard
            store={store}
            hideReport={isProductOwner}
            className="mt-6"
          />
        </div>
      </div>

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
    </section>
  );
}

function MediaThumbnail({
  item,
  index,
  title,
  isActive,
  onSelect,
}: {
  item: MediaItem;
  index: number;
  title: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive}
      aria-label={`${title} - ${index + 1}`}
      className={cn(
        "relative block w-[100px] h-[100px] rounded-md overflow-hidden shrink-0 border-2 cursor-pointer transition-colors",
        isActive ? "border-blue-4" : "border-transparent hover:border-gray-300",
      )}
    >
      <VideoOrImageNext
        src={item.url}
        alt={`${title} - ${index + 1}`}
        fill
        sizes="100px"
        fallbackSrc={PLACEHOLDER_SRC}
        className="pointer-events-none"
        videoProps={{ controls: false, autoPlay: false }}
      />

      {item.type === "video" && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <span className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
            <Play
              className="w-5 h-5 text-gray-700 fill-gray-700"
              aria-hidden="true"
            />
          </span>
        </span>
      )}
    </button>
  );
}

function GalleryArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "right" ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/60 shadow-lg cursor-pointer",
        "flex items-center justify-center backdrop-blur-sm hover:bg-white/80 transition-colors",
        side === "right" ? "right-4" : "left-4",
      )}
    >
      <Icon className="w-5 h-5 text-gray-700" aria-hidden="true" />
    </button>
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

function maskDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 6) return phone;
  return phone.replace(/^\+?(\d{3}).*/, "+$1 *** ***");
}
