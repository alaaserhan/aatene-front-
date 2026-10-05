"use client";

import {
  MediaGallery,
  type MediaItem,
} from "@/src/components/shared/MediaGallery";
import StoreInfoCard from "@/src/components/shared/StoreInfoCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Price } from "@/src/components/ui/Price";
import { RatingStars } from "@/src/components/ui/RatingStars";
import { ShareModal } from "@/src/components/ui/ShareModal";
import {
  useAddServiceToCompare,
  useRemoveServiceFromCompare,
} from "@/src/features/(web)/compares/hooks";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { cn, isVideoFile, sanitizeMediaUrl } from "@/src/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Clock4,
  Flag,
  MoreVertical,
  Phone,
  Send,
  Share2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReportAbuseModal } from "../../reports/components/ReportAbuseModal";
import { Service, ServiceExtra } from "../api";
import { ChatNowButton } from "@/src/components/shared/ChatNowButton";
import type { ChatTarget } from "@/src/lib/chat-links";
import { maskPhone } from "@/src/lib/phone";
import { StorePhoneDialog } from "@/src/features/(web)/stores/components/StorePhoneDialog";

const EXECUTE_TYPE_LABELS: Record<string, string> = {
  hour: "ساعة",
  day: "يوم",
  week: "اسبوع",
  month: "شهر",
};

const PLACEHOLDER_SRC = "/images/placeholders/product-placeholder.svg";

interface ServiceHeroProps {
  service: Service;
}

// TODO: this component needs to be refactored
export default function ServiceHero({ service }: ServiceHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isInCompare, setIsInCompare] = useState(service.is_compare);

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
    qc.invalidateQueries({ queryKey: ["service"] });
  };

  const chatTarget = (askPrice = false): ChatTarget => ({
    type: "store",
    id: service.store?.id,
    serviceId: service.id,
    askPrice,
  });


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
    <section>
      <Breadcrumb
        items={[
          { label: "قائمة الخدمات", href: "/search?type=services" },
          { label: service.title },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <MediaGallery
          items={allMedia}
          title={service.title}
          activeIndex={activeIndex}
          onSelect={setSelectedIndex}
          fallbackSrc={PLACEHOLDER_SRC}
          className="lg:w-[55%] lg:self-start"
        />

        {/* Details */}
        <div className="flex-1">
          <div className="white-card mb-6">
            <div className="mb-4">
              {shouldAskForPrice ? (
                <ChatNowButton
                  size="md"
                  className="text-base"
                  target={chatTarget(true)}
                  label="اطلب السعر"
                  icon={null}
                />
              ) : (
                <Price value={totalPrice} className="text-primary" />
              )}
            </div>

            <RatingStars
              className="mb-4"
              rating={rating}
              count={reviewCount}
              size="md"
            />

            <div className="flex items-start justify-between gap-3">
              <h1 className="heading-1 text-c2-neutral-800">{service.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteButton
                  id={service.id}
                  type="service"
                  isFavorite={service.is_favorite}
                  onSuccess={invalidateService}
                  iconClassName="size-7"
                />
                <ServiceActionsMenu
                  onShare={() => setIsShareOpen(true)}
                  onReport={() => setIsReportOpen(true)}
                />
              </div>
            </div>
          </div>

          {service.extras && service.extras.length > 0 && (
            <ServiceExtras
              extras={service.extras}
              selectedExtras={selectedExtras}
              onToggle={toggleExtra}
            />
          )}

          {service.store && (
            <StoreInfoCard store={service.store} className="mb-6" />
          )}

          <div className="flex flex-col gap-3">
            {service.store?.phone && (
              <button
                type="button"
                onClick={() => setIsPhoneDialogOpen(true)}
                className="flex items-center justify-center gap-2 bg-blue-3 text-white h-11 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span dir="ltr">{maskPhone(service.store.phone)}</span>
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

      {service.store?.phone && (
        <StorePhoneDialog
          phone={service.store.phone}
          open={isPhoneDialogOpen}
          onOpenChange={setIsPhoneDialogOpen}
        />
      )}
    </section>
  );
}



const EXTRAS_TITLE = "تطويرات اختيارية";

// Collapsible on mobile, always expanded on desktop.
function ServiceExtras({
  extras,
  selectedExtras,
  onToggle,
}: {
  extras: ServiceExtra[];
  selectedExtras: number[];
  onToggle: (id: number) => void;
}) {
  const list = (
    <ul className="flex flex-col gap-2 list-none">
      {extras.map((extra) => (
        <li key={extra.id}>
          <ExtraOption
            extra={extra}
            isSelected={selectedExtras.includes(extra.id)}
            onToggle={() => onToggle(extra.id)}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="white-card mb-6">
      <Accordion type="single" collapsible className="lg:hidden">
        <AccordionItem value="extras" className="border-b-0">
          <AccordionTrigger className="py-0 hover:no-underline">
            <span className="flex items-center gap-1.5 text-base font-medium text-c2-navy-1000">
              {EXTRAS_TITLE}
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-c2-navy-100 text-xs font-medium leading-none tabular-nums text-c2-navy-700 [text-box:trim-both_cap_alphabetic]">
                {extras.length}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-3 pb-0">{list}</AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="hidden lg:flex flex-col gap-3">
        <h2 className="text-sm font-medium text-c2-navy-1000">
          {EXTRAS_TITLE}
        </h2>
        {list}
      </div>
    </div>
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
      <Checkbox checked={isSelected} />

      <span className="flex flex-col gap-2">
        <span className="font-medium text-sm text-c2-navy-1000">
          {extra.title}
        </span>
        <div className="flex items-center gap-3">
          <Price
            value={extra.price}
            size="sm"
            className="text-c2-primary font-bold"
          />
          <div className="flex items-center gap-1 text-xs font-medium text-[#80859B]">
            <Clock4 className="w-4 h-4 mb-1" aria-hidden="true" />

            <div className="flex items-center gap-1">
              <span>{extra.execute_count}</span>
              <span>
                {EXECUTE_TYPE_LABELS[extra.execute_type] || extra.execute_type}
              </span>
            </div>
          </div>
        </div>
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
