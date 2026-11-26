"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ImageOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { useLanguage } from "@/src/hooks/use-language";
import { fixMediaUrl } from "@/src/lib/utils";
import { tryOnKeys, useTryOnGeneration, useTryOnGenerations } from "../hooks";
import { getTryOnError } from "../errors";
import { downloadTryOnImage, shareTryOnImage } from "../media";
import type { TryOnGeneration } from "../types";
import { TryOnIcon } from "./TryOnIcon";

function ResultImage({ generation, sizes = "250px" }: { generation: TryOnGeneration; sizes?: string }) {
  if (generation.status === "pending") return <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-blue-3" role="status"><Loader2 className="size-8 animate-spin" /><p className="text-sm">جارٍ إنشاء إطلالتك...</p><p className="text-xs text-c2-slate-550">يمكنك مغادرة الصفحة وسنُعلمك عند اكتمالها.</p></div>;
  if (generation.status === "failed" || !generation.result_url) return <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center"><ImageOff className="size-8 text-c2-danger" /><p className="text-sm font-bold">تعذر إنشاء الصورة</p><p className="text-xs text-c2-slate-550">{generation.error_message || "يرجى المحاولة مجددًا بصورة واضحة."}</p>{generation.coins_refunded && <p className="text-xs text-blue-3">أُعيدت العملات إلى رصيدك.</p>}</div>;
  return <Image src={fixMediaUrl(generation.result_url)} alt="نتيجة تجربة الملابس على صورتك" fill sizes={sizes} className="object-cover" unoptimized />;
}

function expirationLabel(generation: TryOnGeneration) {
  const created = new Date(generation.created_at.replace(" ", "T")).getTime();
  if (!Number.isFinite(created)) return "محفوظة لمدة 30 يومًا";
  const days = Math.max(0, Math.ceil((created + 30 * 86_400_000 - Date.now()) / 86_400_000));
  return `${days} يومًا`;
}

export function TryOnHistory({ enabled, selectedUuid, onSelect }: { enabled: boolean; selectedUuid: string; onSelect: (uuid: string) => void }) {
  const [page, setPage] = useState(1);
  const track = useRef<HTMLDivElement>(null);
  const history = useTryOnGenerations(page, enabled);
  const detail = useTryOnGeneration(selectedUuid, enabled);
  const locale = useLanguage();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!detail.data || detail.data.status === "pending") return;
    void queryClient.invalidateQueries({ queryKey: tryOnKeys.generations });
    void queryClient.invalidateQueries({ queryKey: tryOnKeys.info });
  }, [detail.data?.status, selectedUuid, queryClient, detail.data]);
  const result = detail.data;
  return (
    <section aria-labelledby="try-on-results" className="min-w-0 space-y-4">
      <h2 id="try-on-results" className="text-lg font-bold text-[#17263a] sm:text-xl">آخر نتائج التلبيس</h2>
      {history.isLoading ? <div className="flex min-h-32 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white" role="status"><Loader2 className="size-7 animate-spin text-blue-3" /><span className="sr-only">جارٍ تحميل النتائج</span></div> :
        history.isError ? <div role="alert" className="rounded-2xl border bg-white p-7"><p>{getTryOnError(history.error, "تعذر تحميل النتائج.")}</p><Button variant="ghost" onClick={() => void history.refetch()}>إعادة المحاولة</Button></div> :
        !history.data?.items.length ? <div className="flex items-center gap-5 rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-7">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#edf3f8]"><TryOnIcon name="results" /></span>
          <div className="min-w-0 space-y-1.5"><h3 className="text-base font-bold text-[#17263a] sm:text-lg">لم تبدأ أي تجربة بعد</h3><p className="text-sm leading-relaxed text-c2-slate-550">اختر منتجاتك وأضف صورتك، ثم اضغط «ابدأ التجربة» وستظهر نتائجك هنا.</p></div>
        </div> :
        <div className="relative rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div ref={track} className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1">
            {history.data.items.map((generation) => <article key={generation.uuid} className="relative aspect-[260/286] w-55 shrink-0 snap-start overflow-hidden rounded-lg bg-[#f8fafc] sm:w-[calc((100%_-_3rem)/5)] sm:min-w-45">
              <ResultImage generation={generation} />
              <div className="absolute start-3 top-3 flex flex-col gap-2">
                {generation.result_url && generation.status === "completed" && <>
                  <Button type="button" variant="ghost" size="icon-sm" className="rounded bg-white/95" aria-label="تنزيل نتيجة التجربة" onClick={() => void downloadTryOnImage(generation.result_url!, `aatene-${generation.uuid}.png`)}><TryOnIcon name="download" /></Button>
                  <Button type="button" variant="ghost" size="icon-sm" className="rounded bg-white/95" aria-label="مشاركة نتيجة التجربة" onClick={() => void shareTryOnImage(generation.result_url!)}><TryOnIcon name="share" /></Button>
                </>}
                <Button type="button" variant="ghost" size="icon-sm" className="rounded bg-white/95" aria-label="عرض تفاصيل التجربة" onClick={() => onSelect(generation.uuid)}><TryOnIcon name="view" /></Button>
              </div>
              <span className="absolute bottom-3 end-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white"><TryOnIcon name="clock" /><span>{expirationLabel(generation)}</span></span>
            </article>)}
          </div>
          {history.data.items.length > 4 && <div className="pointer-events-none absolute inset-x-1 top-1/2 flex -translate-y-1/2 justify-between" dir="ltr">
            <Button type="button" variant="ghost" size="icon-sm" className="pointer-events-auto rounded-full bg-[#edf3f8]" aria-label="تمرير النتائج لليسار" onClick={() => track.current?.scrollBy({ left: -260, behavior: "smooth" })}><TryOnIcon name="next" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" className="pointer-events-auto rounded-full bg-[#edf3f8]" aria-label="تمرير النتائج لليمين" onClick={() => track.current?.scrollBy({ left: 260, behavior: "smooth" })}><TryOnIcon name="previous" /></Button>
          </div>}
        </div>}
      {!!history.data && history.data.pagination.total_pages > 1 && <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" disabled={page <= 1 || history.isFetching} onClick={() => setPage(page - 1)}>السابق</Button>
        <span className="font-digits text-sm" dir="ltr">{page} / {history.data.pagination.total_pages}</span>
        <Button variant="ghost" disabled={page >= history.data.pagination.total_pages || history.isFetching} onClick={() => setPage(page + 1)}>التالي</Button>
      </div>}
      <Dialog open={!!selectedUuid} onOpenChange={(open) => { if (!open) onSelect(""); }}>
        <DialogContent dir="rtl" className="max-h-[90dvh] min-w-0 max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader className="pe-5"><DialogTitle>تفاصيل التجربة</DialogTitle><DialogDescription>يمكنك العودة إلى نتائجك خلال 30 يومًا من إنشائها.</DialogDescription></DialogHeader>
          {detail.isLoading ? <Loader2 className="mx-auto my-12 size-8 animate-spin text-blue-3" /> : detail.isError ? <div role="alert"><p>{getTryOnError(detail.error, "تعذر تحميل التجربة.")}</p><Button variant="ghost" onClick={() => void detail.refetch()}>إعادة المحاولة</Button></div> : result && <>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-90 overflow-hidden rounded-xl bg-slate-50"><ResultImage generation={result} sizes="360px" /></div>
            <div className="flex flex-wrap gap-2">{result.products.map((product) => <Link key={product.id} href={`/${locale}/products/${encodeURIComponent(product.slug || String(product.id))}`} className="rounded-lg border px-3 py-2 text-sm text-blue-3 hover:bg-slate-50">{product.name}</Link>)}</div>
            <p className="text-xs text-c2-slate-550">تاريخ التجربة: <bdi>{result.created_at}</bdi> · التكلفة: <bdi className="font-digits">{result.coins_cost}</bdi> عملة</p>
            {result.status === "completed" && result.result_url && <div className="flex gap-3"><Button className="flex-1 bg-blue-3 text-white" onClick={() => void downloadTryOnImage(result.result_url!, `aatene-${result.uuid}.png`)}><TryOnIcon name="download" />تنزيل الصورة</Button><Button variant="outline" className="flex-1 bg-white text-blue-3" onClick={() => void shareTryOnImage(result.result_url!)}><TryOnIcon name="share" />مشاركة</Button></div>}
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
