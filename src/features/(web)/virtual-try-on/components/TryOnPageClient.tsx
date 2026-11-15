"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/auth";
import { useLanguage } from "@/src/hooks/use-language";
import { getTryOnError, isTryOnDisabled } from "../errors";
import { useTryOnInfo, useUploadTryOnPhoto, useTryOnList, useRemoveFromTryOnList, useGenerateTryOn } from "../hooks";
import { UploadPhotoCard } from "./UploadPhotoCard";
import { TryOnProductCard } from "./TryOnProductCard";
import { TryOnCoinsBar } from "./TryOnCoinsBar";
import { TryOnProductPicker } from "./TryOnProductPicker";
import { TryOnHistory } from "./TryOnHistory";
import { TryOnIcon } from "./TryOnIcon";
import { TryOnRechargeDialog } from "./TryOnRechargeDialog";
import { hasInsufficientTryOnBalance } from "../errors";

export function TryOnPageClient() {
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const locale = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const pickerOpen = searchParams.get("browse") === "1";
  function setPickerOpen(open: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (open) params.set("browse", "1"); else params.delete("browse");
    router.push(`/${locale}/virtual-try-on${params.size ? `?${params}` : ""}`);
  }
  const infoQuery = useTryOnInfo();
  const info = infoQuery.data;
  const active = isLoggedIn && !!info?.is_active;
  const list = useTryOnList(active);
  const upload = useUploadTryOnPhoto();
  const remove = useRemoveFromTryOnList();
  const generate = useGenerateTryOn();
  const selectedUuid = searchParams.get("generation") || "";

  function selectGeneration(uuid: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (uuid) params.set("generation", uuid); else params.delete("generation");
    const query = params.toString();
    router.replace(`/${locale}/virtual-try-on${query ? `?${query}` : ""}`, { scroll: false });
  }

  if (infoQuery.isLoading || (isLoggedIn && !info && !infoQuery.isError)) return <div className="grid min-h-96 place-items-center" role="status"><Loader2 className="size-9 animate-spin text-blue-3" /><span className="sr-only">جارٍ تحميل غرفة التجربة</span></div>;

  const disabled = !info?.is_active || isTryOnDisabled(infoQuery.error);
  const products = list.data?.items ?? [];
  const count = list.data?.pagination.total ?? info?.list_count ?? 0;
  const canGenerate = active && !!info.try_on_image_url && count > 0 && count <= info.max_items && !list.isFetching && !list.isError && !remove.isPending && !upload.isPending && !generate.isPending && (info.coins_per_generation === 0 || info.coins_balance >= info.coins_per_generation);

  if (active && info && pickerOpen) return <TryOnProductPicker info={info} onClose={() => setPickerOpen(false)} />;

  return (
    <div dir="rtl" className="w-full flex-1 bg-[#f8fafc]">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-4 pb-14 pt-6 sm:px-8 md:pt-10 lg:px-20">
        <header className="space-y-4">
          <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-c2-slate-550 sm:text-sm"><Link href={`/${locale}`}>الرئيسية</Link><TryOnIcon name="breadcrumb" /><span className="font-bold text-blue-3">غرفة التجربة</span></nav>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-2"><h1 className="flex items-center gap-3 text-2xl font-bold text-[#17263a] sm:text-4xl"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-c2-navy-700-a08 sm:size-11.5"><TryOnIcon name="sparkles" /></span>غرفة التجربة</h1><p className="text-xs leading-relaxed text-c2-slate-550 sm:text-base">جرّب القطع التي اخترتها على صورتك قبل الشراء، ونسّق إطلالتك بثقة.</p></div>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#edf3f8] px-3 py-2 text-[10px] font-bold text-blue-3 sm:px-3.5 sm:text-sm"><TryOnIcon name="badge" />{disabled ? "غير متاحة حاليًا" : generate.isPending ? "جارٍ بدء التجربة" : "جاهزة للتجربة"}</span>
          </div>
        </header>

        {infoQuery.isError && !isTryOnDisabled(infoQuery.error) ? <div className="space-y-4 rounded-2xl border bg-white p-7 text-center" role="alert"><p>{getTryOnError(infoQuery.error, "تعذر تحميل غرفة التجربة.")}</p><Button onClick={() => void infoQuery.refetch()}>إعادة المحاولة</Button></div> : disabled ? <div className="space-y-4 rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center"><h2 className="text-xl font-bold">التجربة الافتراضية غير متاحة حاليًا</h2><p className="text-sm text-c2-slate-550">يرجى المحاولة لاحقًا. تبقى نتائجك السابقة متاحة في السجل.</p><Button asChild variant="outline" className="bg-white text-blue-3"><Link href={`/${locale}/products`}>تصفح المنتجات<ArrowLeft className="size-4" /></Link></Button></div> : info && <>
          <div className="grid min-w-0 gap-6 rounded-3xl border border-[#e2e8f0] bg-white p-4 shadow-[0_10px_28px_rgba(16,34,53,0.08)] sm:p-7 md:grid-cols-[minmax(0,553fr)_minmax(0,612fr)] md:gap-8">
            <div className="min-w-0"><div className="mb-4 md:hidden"><TryOnCoinsBar info={info} onRecharge={() => setRechargeOpen(true)} /></div><UploadPhotoCard currentPhotoUrl={info.try_on_image_url} onUpload={(file) => upload.mutateAsync(file)} isUploading={upload.isPending} /></div>
            <section className="flex min-w-0 flex-col gap-6" aria-labelledby="try-on-products">
              <div className="hidden md:block"><TryOnCoinsBar info={info} onRecharge={() => setRechargeOpen(true)} /></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3"><div><h2 id="try-on-products" className="text-lg font-bold text-[#17263a] sm:text-xl">المنتجات المضافة</h2><p className="mt-1 text-xs text-c2-slate-550">يمكنك تجربة حتى <bdi className="font-digits">{info.max_items}</bdi> قطع معًا</p></div><Button type="button" variant="ghost" className="h-auto p-0 text-xs font-bold text-blue-3 underline underline-offset-4 hover:bg-transparent sm:text-sm" onClick={() => setPickerOpen(true)}>إضافة منتجات</Button></div>
                {list.isLoading ? <div className="grid min-h-60 place-items-center" role="status"><Loader2 className="size-7 animate-spin text-blue-3" /></div> : list.isError ? <div role="alert" className="space-y-3 rounded-xl border p-5"><p className="text-sm">{getTryOnError(list.error, "تعذر تحميل المنتجات المضافة.")}</p><Button onClick={() => void list.refetch()}>إعادة المحاولة</Button></div> : products.length ? <div className="space-y-3">{products.map((product) => <TryOnProductCard key={product.id} product={product} variant="list" onRemove={(id) => remove.mutate(id)} isRemoving={remove.isPending && remove.variables === product.id} disabled={remove.isPending || generate.isPending} />)}</div> : <div className="flex min-h-90 flex-col items-center justify-center gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-10 text-center"><span className="flex size-22 items-center justify-center rounded-full bg-[#edf3f8]"><TryOnIcon name="hanger" /></span><h3 className="text-lg font-bold text-[#17263a]">لا توجد منتجات للتجربة بعد</h3><p className="max-w-80 text-sm leading-relaxed text-c2-slate-550">أضف الملابس من صفحات المنتجات باستخدام أيقونة التجربة، وستظهر هنا تلقائيًا.</p><Button type="button" className="h-12 bg-blue-3 font-bold text-white" onClick={() => setPickerOpen(true)}>تصفح المنتجات<ArrowLeft className="size-4" /></Button></div>}
              </div>
              <div className="mt-auto space-y-3 pt-6 md:pb-32">
                {count > info.max_items && <p role="alert" className="text-sm text-c2-danger">تجاوزت الحد الأقصى. أزل بعض المنتجات لتبقى <bdi className="font-digits">{info.max_items}</bdi> قطع أو أقل.</p>}
                <Button type="button" className="h-13 w-full rounded-lg bg-blue-3 text-base font-bold text-white" disabled={!canGenerate} onClick={() => generate.mutate(undefined, { onSuccess: (data) => { if (data.record) selectGeneration(data.record.uuid); }, onError: (error) => { if (hasInsufficientTryOnBalance(error)) setRechargeOpen(true); } })}>{generate.isPending ? <Loader2 className="size-5 animate-spin" /> : <TryOnIcon name="generate" />}{generate.isPending ? "جارٍ بدء التجربة..." : "ابدأ التجربة"}</Button>
                {(!info.try_on_image_url || count === 0) && <p className="text-center text-xs text-c2-slate-550">أضف صورتك ومنتجًا واحدًا على الأقل لبدء التجربة.</p>}
              </div>
            </section>
          </div>
        </>}
        <TryOnHistory enabled={isLoggedIn} selectedUuid={selectedUuid} onSelect={selectGeneration} />
        <TryOnRechargeDialog open={active && rechargeOpen} onOpenChange={setRechargeOpen} />
      </div>
    </div>
  );
}
