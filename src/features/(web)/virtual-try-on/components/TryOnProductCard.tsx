"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, Plus, Shirt } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { cn, fixMediaUrl } from "@/src/lib/utils";
import { useLanguage } from "@/src/hooks/use-language";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import type { TryOnProduct } from "../types";
import { TryOnIcon } from "./TryOnIcon";

interface TryOnProductCardProps {
  product: TryOnProduct;
  onAdd?: (productId: number) => void;
  onRemove?: (productId: number) => void;
  isAdding?: boolean;
  isRemoving?: boolean;
  disabled?: boolean;
  variant?: "picker" | "list";
}

export function TryOnProductCard({ product, onAdd, onRemove, isAdding, isRemoving, disabled, variant = "picker" }: TryOnProductCardProps) {
  const locale = useLanguage();
  const selected = !!product.in_try_on_list || variant === "list";
  const busy = isAdding || isRemoving;
  const productHref = `/${locale}/products/${encodeURIComponent(product.slug || String(product.id))}`;
  const image = product.cover ? fixMediaUrl(product.cover) : null;
  const price = product.price_after_discount ?? product.price;
  const priceLabel = shouldShowAskForPrice(product.ask_for_price, price) ? "اطلب السعر" : `${formatPrice(price ?? 0)} ₪`;
  const storeHref = product.store?.slug ? `/${locale}/stores/${encodeURIComponent(product.store.slug)}` : null;

  if (variant === "list") return (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-3 bg-white p-3">
      <Checkbox checked disabled={busy || disabled} onCheckedChange={() => onRemove?.(product.id)} aria-label={`إزالة ${product.name} من التجربة`} className="size-6 shrink-0 rounded border-blue-3 data-[state=checked]:bg-blue-3" />
      <Link href={productHref} className="relative h-21.5 w-19.5 shrink-0 overflow-hidden rounded-lg bg-slate-50">
        {image ? <Image src={image} alt={product.name} fill sizes="78px" className="object-cover" unoptimized /> : <Shirt className="m-auto h-full w-8 text-slate-400" />}
      </Link>
      <div className="min-w-0 flex-1 space-y-1">
        <Link href={productHref} className="line-clamp-2 text-sm font-bold text-[#17263a] hover:underline sm:text-base">{product.name}</Link>
        <p className="font-digits text-lg font-medium text-c2-navy-1000" dir="ltr">{priceLabel}</p>
        {product.store && (storeHref ? <Link href={storeHref} className="block truncate text-xs text-c2-slate-550 hover:underline sm:text-sm">{product.store.name}</Link> : <p className="truncate text-xs text-c2-slate-550">{product.store.name}</p>)}
      </div>
      <Button type="button" variant="ghost" size="icon" disabled={busy || disabled} onClick={() => onRemove?.(product.id)} className="size-9 rounded-lg bg-rose-50 text-c2-danger hover:bg-rose-100" aria-label={`حذف ${product.name}`}>{busy ? <Loader2 className="size-4 animate-spin" /> : <TryOnIcon name="trash" />}</Button>
    </article>
  );

  return (
    <article className={cn("relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white", selected ? "border-blue-3" : "border-[#e2e8f0]")}>
      <Link href={productHref} className="relative aspect-square overflow-hidden bg-slate-50">
        {image ? <Image src={image} alt={product.name} fill sizes="(max-width: 767px) 40vw, 200px" className="object-cover" unoptimized /> : <Shirt className="m-auto h-full w-12 text-slate-400" />}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={productHref} className="line-clamp-2 text-sm font-bold text-[#17263a] hover:underline">{product.name}</Link>
        {product.store && (storeHref ? <Link href={storeHref} className="truncate text-xs text-c2-slate-550 hover:underline">{product.store.name}</Link> : <p className="truncate text-xs text-c2-slate-550">{product.store.name}</p>)}
        <p className="mt-auto font-digits text-sm font-bold text-blue-3" dir="ltr">{priceLabel}</p>
        <Button type="button" variant="outline" className={cn("mt-1 w-full bg-white text-xs text-blue-3 hover:bg-slate-50", selected && "border-blue-3 bg-[#edf3f8]")} onClick={() => selected ? onRemove?.(product.id) : onAdd?.(product.id)} disabled={disabled || busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : selected ? <Check className="size-4" /> : <Plus className="size-4" />}
          {selected ? "تمت الإضافة" : "أضف للتجربة"}
        </Button>
      </div>
    </article>
  );
}
