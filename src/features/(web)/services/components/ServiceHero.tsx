"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Share2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Play,
  Phone,
  MoreVertical,
  Send,
  Check,
  Clock4,
} from "lucide-react";
import { Service, ServiceExtra } from "../api";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import {
  useAddServiceToCompare,
  useRemoveServiceFromCompare,
} from "@/src/features/(web)/compares/hooks";
import { cn, isVideoFile, sanitizeMediaUrl } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { productAskForPriceButtonClassName } from "@/src/features/(web)/product/components/productAskForPriceButton";
import { useQueryClient } from "@tanstack/react-query";
import { ReportAbuseModal } from "../../reports/components/ReportAbuseModal";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { RatingStars } from "@/src/components/ui/RatingStars";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { VideoOrImageNext } from "@/src/components/ui/VideoOrImageNext";
import { useAuthStore } from "@/src/stores/auth-store";

const EXECUTE_TYPE_LABELS: Record<string, string> = {
  hour: "ساعة",
  day: "يوم",
  week: "اسبوع",
  month: "شهر",
};

const PLACEHOLDER_SRC = "/images/placeholders/product-placeholder.svg";

type MediaItem = { type: "image" | "video"; url: string };

interface ServiceHeroProps {
  service: Service;
}

export default function ServiceHero({ service }: ServiceHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isInCompare, setIsInCompare] = useState(service.is_compare);

  const router = useRouter();
  const params = useParams();
  const lang = params?.locale || params?.lang || "ar";
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { mutate: addToCompare } = useAddServiceToCompare();
  const { mutate: removeFromCompare } = useRemoveServiceFromCompare();

  const allMedia = useMemo<MediaItem[]>(() => {
    const sources = service.images_urls?.length
      ? service.images_urls
      : [service.image_url];

    const items: MediaItem[] = [];
    const seen = new Set<string>();

    sources.forEach((source) => {
      const url = sanitizeMediaUrl(source);
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({ type: isVideoFile(url) ? "video" : "image", url });
    });

    return items;
  }, [service.images_urls, service.image_url]);

  // Keep the selection valid when the media list shrinks between renders.
  const activeIndex = Math.min(selectedIndex, Math.max(allMedia.length - 1, 0));
  const currentMedia = allMedia[activeIndex];
  const hasGallery = allMedia.length > 1;

  const rating = parseFloat(service.review_rate || "0");
  const reviewCount = parseInt(service.review_count || "0");

  const basePrice = parseFloat(service.price || "0");
  const shouldAskForPrice = shouldShowAskForPrice(
    service.ask_for_price,
    service.price,
  );
  const extrasTotal = useMemo(
    () =>
      selectedExtras.reduce((sum, id) => {
        const extra = service.extras?.find((item) => item.id === id);
        return sum + (extra ? parseFloat(extra.price) : 0);
      }, 0),
    [selectedExtras, service.extras],
  );
  const totalPrice = basePrice + extrasTotal;

  const invalidateService = () => {
    // Both the slug and the id variants are cached, so refresh either one.
    qc.invalidateQueries({ queryKey: ["service", service.slug] });
    qc.invalidateQueries({ queryKey: ["service", service.id] });
  };

  const requireAuth = () => {
    if (user) return true;
    router.push(`/${lang}/login`);
    return false;
  };

  const goToChat = (askPrice = false) => {
    if (!requireAuth()) return;
    const storeId = service.store?.id;
    if (!storeId) return;
    const query = new URLSearchParams({
      type: "store",
      id: String(storeId),
      serviceId: String(service.id),
      ...(askPrice ? { askPrice: "1" } : {}),
    });
    router.push(`/${lang}/chat?${query.toString()}`);
  };

  const showPrev = () =>
    setSelectedIndex(activeIndex > 0 ? activeIndex - 1 : allMedia.length - 1);

  const showNext = () =>
    setSelectedIndex(activeIndex < allMedia.length - 1 ? activeIndex + 1 : 0);

  const toggleExtra = (id: number) =>
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleCompare = () => {
    const mutate = isInCompare ? removeFromCompare : addToCompare;
    mutate(service.id, {
      onSuccess: () => {
        setIsInCompare(!isInCompare);
        invalidateService();
      },
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <Breadcrumb
        items={[
          { label: "قائمة الخدمات", href: "/search?type=services" },
          { label: service.title },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Gallery */}
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
                    title={service.title}
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
              alt={service.title}
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
        <div className="flex-1 flex flex-col gap-6">
          <div className="white-card">
            <div className="flex items-center gap-2 flex-wrap">
              {shouldAskForPrice ? (
                <button
                  type="button"
                  onClick={() => goToChat(true)}
                  className={productAskForPriceButtonClassName}
                >
                  اطلب السعر
                </button>
              ) : (
                <p className="text-2xl font-normal">
                  {formatPrice(totalPrice)} ₪
                </p>
              )}
              <span
                aria-hidden="true"
                className="w-px h-4 bg-gray-300 mx-2 shrink-0"
              />
              <RatingStars rating={rating} count={reviewCount} size="md" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-medium leading-relaxed">
                {service.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteButton
                  id={service.id}
                  type="service"
                  isFavorite={service.is_favorite}
                  className="w-8 h-8 rounded-full"
                  iconClassName="w-5 h-5"
                  onSuccess={invalidateService}
                />
                <ServiceActionsMenu
                  onShare={() => setIsShareOpen(true)}
                  onReport={() => setIsReportOpen(true)}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {service.extras && service.extras.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-blue-3">
                تطويرات اختيارية
              </h2>
              <ul className="flex flex-col gap-2 list-none">
                {service.extras.map((extra) => (
                  <li key={extra.id}>
                    <ExtraOption
                      extra={extra}
                      isSelected={selectedExtras.includes(extra.id)}
                      onToggle={() => toggleExtra(extra.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {service.store?.phone && (
              <a
                href={`tel:${service.store.phone}`}
                onClick={(e) => {
                  if (isPhoneRevealed) return;
                  e.preventDefault();
                  setIsPhoneRevealed(true);
                }}
                className="flex items-center justify-center gap-2 bg-blue-3 text-white h-11 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                <span dir="ltr">
                  {isPhoneRevealed
                    ? service.store.phone
                    : service.store.phone.replace(
                        /^\+?(\d{3}).*/,
                        "+$1 *** ***",
                      )}
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
                isInCompare ? "text-c2-danger" : "text-blue-4",
              )}
            >
              {isInCompare ? "إزالة من المقارنة" : "أضف الى المقارنة"}
            </button>
          </div>
        </div>
      </div>

      <ReportAbuseModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        type="service"
        id={service.id}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={typeof window !== "undefined" ? window.location.href : ""}
        title={service.title}
        description="قم بمشاركة هذه الخدمة مع أصدقائك"
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

function ExtraOption({
  extra,
  isSelected,
  onToggle,
}: {
  extra: ServiceExtra;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      onClick={onToggle}
      className={cn(
        "w-full border rounded-lg p-3 flex items-center gap-3 text-start cursor-pointer transition-colors",
        isSelected
          ? "border-blue-4 bg-blue-5"
          : "border-gray-200 hover:border-gray-300",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors",
          isSelected ? "bg-blue-4 border-none" : "border-gray-200 bg-white",
        )}
      >
        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
      </span>

      <span className="flex flex-col gap-1">
        <span className="font-medium text-sm">{extra.title}</span>
        <span className="flex items-center gap-4 text-xs text-gray-2">
          <span className="font-medium">
            {formatPrice(extra.price)} <span className="text-base">₪</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock4 className="w-3 h-3 mb-0.5" aria-hidden="true" />
            {extra.execute_count}{" "}
            {EXECUTE_TYPE_LABELS[extra.execute_type] || extra.execute_type}
          </span>
        </span>
      </span>
    </button>
  );
}

function ServiceActionsMenu({
  onShare,
  onReport,
}: {
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
        aria-label="خيارات الخدمة"
        className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-30"
        >
          <button
            type="button"
            role="menuitem"
            onClick={runAndClose(onShare)}
            className={itemClassName}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            مشاركة الخدمة
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={runAndClose(onReport)}
            className={itemClassName}
          >
            <Flag className="w-4 h-4" aria-hidden="true" />
            ابلاغ عن الخدمة
          </button>
        </div>
      )}
    </div>
  );
}
