"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";
import { useLanguage } from "@/src/hooks/use-language";
import { cn } from "@/src/lib/utils";
import { useAddToTryOnList, useTryOnInfo, useTryOnProductIndex, useTryOnList } from "../hooks";
import { TryOnIcon } from "./TryOnIcon";
import { productImageActionClassName } from "../../product/components/productImageAction";
import { TryOnRechargeDialog } from "./TryOnRechargeDialog";
import { isCoinsEnabled } from "@/src/config/features";

export function TryOnProductEntry({ productId, className, variant = "default" }: { productId: number; className?: string; variant?: "default" | "card" }) {
  const [open, setOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const locale = useLanguage();
  const router = useRouter();
  const info = useTryOnInfo();
  const products = useTryOnProductIndex(!!info.data?.is_active);
  const list = useTryOnList(open && !!info.data?.is_active);
  const add = useAddToTryOnList();
  const product = products.data?.[productId];
  if (!info.data?.is_active || !product) return null;
  const data = info.data;
  const insufficientBalance = data.coins_per_generation > 0 && data.coins_balance < data.coins_per_generation;

  async function select(goToRoom: boolean) {
    if (goToRoom && insufficientBalance) {
      if (!isCoinsEnabled()) {
        toast.error("رصيدك غير كافٍ لتجربة جديدة حاليًا.");
        return;
      }
      setOpen(false);
      setRechargeOpen(true);
      return;
    }
    if (!list.data || list.isFetching || list.isError) return;
    const included = list.data.items.some((item) => item.id === productId);
    if (!included && list.data.pagination.total >= data.max_items) {
      toast.error(`يمكن إضافة ${data.max_items} منتجات كحد أقصى. أزل منتجًا من غرفة التجربة أولًا.`);
      return;
    }
    try {
      if (!included) await add.mutateAsync(productId);
      setOpen(false);
      if (goToRoom) router.push(`/${locale}/virtual-try-on`);
    } catch {
      // The mutation displays the API error and keeps the dialog open.
    }
  }

  return <>
    <Button type="button" variant="ghost" size="icon" className={cn(variant === "card" ? productImageActionClassName : "relative z-20 size-12 rounded-full bg-white/55 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_8px_3px_rgba(0,0,0,0.15)] backdrop-blur-sm hover:bg-white/85", className)} aria-label={`تجربة ${product.name} على صورتك`} title="جرّب المنتج عليك" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); }}><TryOnIcon name={variant === "card" ? "nav" : "entry"} /></Button>
    <TryOnRechargeDialog open={rechargeOpen && data.is_active} onOpenChange={setRechargeOpen} />
    <Dialog open={open && data.is_active} onOpenChange={(next) => { if (!add.isPending) setOpen(next); }}>
      <DialogContent dir="rtl" showCloseButton={false} className="max-h-[90dvh] min-w-0 gap-0 overflow-y-auto rounded-3xl p-0 shadow-[0_25px_60px_-15px_rgba(10,20,32,0.8)] sm:max-w-218" overlayClassName="backdrop-blur-[13.1px]">
        <DialogClose disabled={add.isPending} className="absolute end-6 top-5 z-10 grid size-8 place-items-center rounded-full hover:bg-slate-100" aria-label="إغلاق"><TryOnIcon name="close" /></DialogClose>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-3xl bg-linear-to-b from-blue-3/10 to-transparent" />
        <div className="relative grid min-w-0 sm:min-h-140 sm:grid-cols-[minmax(0,493fr)_minmax(0,377fr)]">
          <div className="flex min-w-0 flex-col items-center justify-center gap-5 px-6 pb-8 pt-14 text-center sm:px-8 sm:py-16">
            <DialogTitle className="max-w-80 text-xl font-medium leading-relaxed text-[#1c274c] sm:text-2xl">{data.coins_per_generation === 0 ? "جرّب إطلالتك مجانًا الآن" : <>رصيدك الحالي <bdi className="font-digits font-bold text-[#3d5e83]">{data.coins_balance}</bdi> عملة</>}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#5c6370]">{data.coins_per_generation === 0 ? "أضف صورتك واختر الملابس التي ترغب في تجربتها." : <>تكلفة التجربة <bdi className="font-digits">{data.coins_per_generation}</bdi> عملة. يمكنك مراجعة رصيدك ومنتجاتك داخل غرفة التجربة.</>}</DialogDescription>
            <p className="max-w-96 text-base leading-relaxed text-[#1a253c]">جرّبه عليك الآن، أو أضفه إلى غرفة التجربة لتجربته مع منتجات أخرى.</p>
            {list.isError && <div className="text-sm text-c2-danger" role="alert">تعذر تحميل قائمة التجربة. <Button variant="ghost" onClick={() => void list.refetch()}>إعادة المحاولة</Button></div>}
            <div className="flex w-full flex-col gap-3">
              <Button className="h-13 w-full rounded-lg bg-blue-3 font-bold text-white" disabled={!list.data || list.isFetching || add.isPending} onClick={() => void select(true)}>{add.isPending && <Loader2 className="size-4 animate-spin" />}جرّبه عليك الآن</Button>
              <Button variant="outline" className="h-13 w-full rounded-lg border-blue-3 bg-white font-bold text-blue-3" disabled={!list.data || list.isFetching || add.isPending} onClick={() => void select(false)}>أضف إلى غرفة التجربة</Button>
            </div>
            <p className="text-xs leading-relaxed text-[#5c6370]">يمكنك إضافة حتى <bdi className="font-digits">{data.max_items}</bdi> منتجات إلى قائمة التجربة.</p>
          </div>
          <div className="order-first flex min-h-48 items-center justify-center bg-blue-3/5 py-6 sm:order-last sm:min-h-140">
            <div className="relative h-46 w-50 overflow-hidden sm:h-[281px] sm:w-[307px]"><Image src="/virtual-try-on/261d3.png" alt="" width={580} height={317} className="absolute max-w-none" style={{ width: "188.91%", height: "112.89%", left: "-46.89%", top: "-5.78%" }} aria-hidden="true" /></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
