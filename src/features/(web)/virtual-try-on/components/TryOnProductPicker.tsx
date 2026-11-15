"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { normalizeAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { fixMediaUrl } from "@/src/lib/utils";
import { useTryOnCategories, useTryOnProducts } from "../hooks";
import { getTryOnError } from "../errors";
import type { TryOnInfo } from "../types";

export function TryOnProductPicker({ onClose, info }: { onClose: () => void; info: TryOnInfo }) {
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const categories = useTryOnCategories(info.is_active);
  const products = useTryOnProducts(category === "all" ? undefined : Number(category), page, info.is_active);
  const pagination = products.data?.pagination;
  const first = pagination?.total ? (page - 1) * pagination.per_page + 1 : 0;
  const last = pagination ? Math.min(page * pagination.per_page, pagination.total) : 0;

  return <main dir="rtl" className="min-w-0 flex-1 bg-white">
    <div className="mx-auto w-full max-w-360 space-y-8 px-4 py-8 sm:px-8 lg:px-17">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
        <h1 className="text-xl font-bold text-[#17263a] sm:text-2xl">منتجات التجربة الافتراضية</h1>
        <Button type="button" variant="ghost" className="font-bold text-blue-3" onClick={onClose}><ArrowRight className="size-4" />العودة لغرفة التجربة</Button>
      </div>
      <div className="space-y-4">
        <Select dir="rtl" value={category} onValueChange={(value) => { setCategory(value); setPage(1); }}>
          <SelectTrigger className="h-14 w-full bg-[#edf3f8] text-blue-3 sm:w-72" aria-label="تصفية منتجات التجربة حسب الفئة"><SelectValue placeholder="جميع الفئات" /></SelectTrigger>
          <SelectContent><SelectItem value="all">جميع الفئات</SelectItem>{categories.data?.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.full_name || item.name}</SelectItem>)}</SelectContent>
        </Select>
        {pagination && <p className="text-sm text-[#737373]"><bdi className="font-digits">{pagination.total}</bdi> نتيجة — إظهار <bdi className="font-digits">{first}–{last}</bdi></p>}
        {categories.isError && <div role="alert" className="text-sm text-c2-danger">{getTryOnError(categories.error, "تعذر تحميل الفئات.")}<Button variant="ghost" onClick={() => void categories.refetch()}>إعادة المحاولة</Button></div>}
      </div>
      {products.isLoading ? <div className="grid min-h-80 place-items-center" role="status"><Loader2 className="size-8 animate-spin text-blue-3" /><span className="sr-only">جارٍ تحميل المنتجات</span></div> : products.isError ? <div role="alert" className="space-y-4 py-16 text-center"><p>{getTryOnError(products.error, "تعذر تحميل المنتجات.")}</p><Button onClick={() => void products.refetch()}>إعادة المحاولة</Button></div> : products.data?.items.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-4">
        {products.data.items.map((product) => <ProductCard key={product.id} id={product.id} slug={product.slug} name={product.name} cover={product.cover ? fixMediaUrl(product.cover) : "/images/placeholders/product-placeholder.svg"} price={product.price ?? 0} priceAfterDiscount={product.price_after_discount ?? undefined} ask_for_price={normalizeAskForPrice(product.ask_for_price)} reviewRate={product.review_rate} reviewCount={product.review_count} isFavorite={product.is_favorite} storeId={product.store?.id} variant="c2" />)}
      </div> : <p className="py-20 text-center text-[#737373]">لا توجد منتجات متاحة للتجربة في هذه الفئة.</p>}
      {pagination && pagination.total_pages > 1 && <div className="flex items-center justify-center gap-4">
        <Button variant="outline" disabled={page <= 1 || products.isFetching} onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>السابق</Button>
        <span className="font-digits text-sm" dir="ltr">{page} / {pagination.total_pages}</span>
        <Button variant="outline" disabled={page >= pagination.total_pages || products.isFetching} onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>التالي</Button>
      </div>}
    </div>
  </main>;
}
