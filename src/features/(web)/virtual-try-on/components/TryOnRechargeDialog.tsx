"use client";

import { useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";
import { useGetCoinsPackages, usePurchaseForMe } from "@/src/features/(dashboard)/coins/hooks";
import { cn } from "@/src/lib/utils";
import { getTryOnError } from "../errors";
import { TryOnIcon } from "./TryOnIcon";
import { isCoinsEnabled } from "@/src/config/features";

function formatPackagePrice(price: string, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 2 }).format(Number(price));
  } catch {
    return `${Number(price).toLocaleString("en-US")} ${currency}`;
  }
}

type RechargeDialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

/** Renders nothing while the coins system is switched off (NEXT_PUBLIC_COINS_ENABLED). */
export function TryOnRechargeDialog(props: RechargeDialogProps) {
  return isCoinsEnabled() ? <RechargeDialog {...props} /> : null;
}

function RechargeDialog({ open, onOpenChange }: RechargeDialogProps) {
  const purchaseLockRef = useRef(false);
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!purchaseLockRef.current) onOpenChange(next); }}>
      <DialogContent dir="rtl" showCloseButton={false} className="max-h-[90dvh] min-w-0 gap-0 overflow-y-auto rounded-3xl border border-white/15 p-0 shadow-[0_25px_60px_-15px_rgba(10,20,32,0.8),0_0_50px_rgba(60,93,128,0.12)] sm:max-w-[1009px] sm:rounded-3xl" overlayClassName="backdrop-blur-[13.1px]">
        <RechargeContent purchaseLockRef={purchaseLockRef} />
      </DialogContent>
    </Dialog>
  );
}

function RechargeContent({ purchaseLockRef }: { purchaseLockRef: RefObject<boolean> }) {
  const packagesQuery = useGetCoinsPackages();
  const purchase = usePurchaseForMe();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const packages = (packagesQuery.data?.packages ?? []).filter((item) => item.is_active && Number(item.coins_count) > 0 && Number.isFinite(Number(item.price)) && Number(item.price) >= 0);
  const selected = packages.find((item) => item.id === selectedId) ?? packages[0];
  const busy = purchase.isPending || submitted;

  async function refreshBalance() {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-coins"] }),
        queryClient.invalidateQueries({ queryKey: ["try-on", "info"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  async function checkout() {
    if (!selected || purchaseLockRef.current || busy || packagesQuery.isFetching || packagesQuery.isError) return;
    purchaseLockRef.current = true;
    setError("");
    try {
      const callback = new URL(window.location.href);
      callback.hash = "";
      const result = await purchase.mutateAsync({ package_id: selected.id, callback_url: callback.toString() });
      // A created transaction is not proof that payment was completed.
      setSubmitted(true);
      void refreshBalance();
      const paymentUrl = result.transaction?.payment_url;
      if (paymentUrl) {
        let destination: URL;
        try {
          destination = new URL(paymentUrl);
          if (destination.protocol !== "https:" || destination.username || destination.password) throw new Error("Invalid payment URL");
        } catch {
          setError("تعذر فتح رابط الدفع. يرجى التواصل مع الدعم لمراجعة طلب الشحن.");
          return;
        }
        window.location.assign(destination.toString());
      }
    } catch (cause) {
      setError(isAxiosError(cause) && cause.response?.status === 404
        ? "خدمة شحن الرصيد غير متاحة حاليًا. يرجى المحاولة لاحقًا."
        : getTryOnError(cause, "تعذر بدء شحن الرصيد. يرجى المحاولة مجددًا."));
    } finally {
      purchaseLockRef.current = false;
    }
  }

  return <>
    <DialogClose disabled={purchase.isPending} className="absolute end-6 top-5 z-10 grid size-8 place-items-center rounded-full hover:bg-slate-100" aria-label="إغلاق"><TryOnIcon name="close" /></DialogClose>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-3xl bg-linear-to-b from-[#3c5d80]/10 to-transparent" />
    <div className="relative grid min-w-0 md:min-h-140 md:grid-cols-[minmax(0,630fr)_minmax(0,377fr)]">
      <div className="flex min-w-0 flex-col items-center justify-center gap-4 px-5 pb-8 pt-14 text-center sm:px-6 md:pb-14 md:pt-28">
        <div className="max-w-96 space-y-2">
          <DialogTitle className="text-xl font-bold leading-[33px] tracking-[-0.6px] text-blue-3 sm:text-2xl">رصيدك غير كافٍ لتجربة جديدة</DialogTitle>
          <DialogDescription className="text-[13.5px] leading-[22px] text-[#64748b]">احصل على رصيد إضافي الآن، وواصل تجربة إطلالاتك المفضلة.</DialogDescription>
        </div>

        {packagesQuery.isPending ? <div role="status" className="grid min-h-48 w-full place-items-center text-blue-3"><Loader2 className="size-7 animate-spin" /><span className="sr-only">جارٍ تحميل خيارات الشحن</span></div>
          : packagesQuery.isError ? <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3"><p className="text-sm text-c2-danger">تعذر تحميل خيارات الشحن.</p><Button variant="outline" onClick={() => void packagesQuery.refetch()}>إعادة المحاولة</Button></div>
            : !packages.length ? <p role="status" className="py-16 text-sm text-[#64748b]">لا تتوفر خيارات لشحن الرصيد حاليًا. يرجى المحاولة لاحقًا.</p>
              : <fieldset disabled={busy} className="w-full min-w-0 max-w-[559px] pb-2 pt-8">
                <legend className="sr-only">اختر رصيد الشحن</legend>
                <div className={cn("grid grid-cols-2 items-end gap-x-3 gap-y-8", packages.length === 1 ? "grid-cols-1" : packages.length === 3 ? "sm:grid-cols-3" : packages.length > 3 && "lg:grid-cols-4")}>
                  {packages.map((item) => {
                    const checked = selected?.id === item.id;
                    return <label key={item.id} className="relative block min-w-0 cursor-pointer">
                      <input type="radio" name="try-on-coins-package" value={item.id} checked={checked} onChange={() => setSelectedId(item.id)} className="peer sr-only" />
                      <span className={cn("relative flex h-35 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-blue-3 bg-white px-3 py-4 text-[#1c1c1c] transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-blue-3 peer-focus-visible:ring-offset-4 peer-disabled:cursor-default", checked && "-translate-y-4 border-2 bg-linear-[162deg,rgba(255,255,255,0.2)_26%,rgba(88,143,208,0.2)_54%] text-blue-3 sm:h-[157px]")}>
                        <span className="absolute start-2 top-2"><TryOnIcon name={checked ? "packageSelected" : "packageUnselected"} /></span>
                        <span className="text-sm font-bold">شحن الرصيد</span>
                        <span className="font-digits text-2xl font-bold leading-none" dir="ltr">{Number(item.coins_count).toLocaleString("en-US")}</span>
                        <span className="text-xs text-[#4b5563]">عملة</span>
                        <span className="w-full border-t border-[#3c5e85]/20 pt-2 font-digits text-base font-bold leading-5" dir="ltr">{formatPackagePrice(item.price, item.currency)}</span>
                      </span>
                    </label>;
                  })}
                </div>
              </fieldset>}

        <div className="flex w-full max-w-[535px] flex-col items-center gap-3 pt-2">
          {error && <p role="alert" className="text-sm leading-relaxed text-c2-danger">{error}</p>}
          {submitted ? <>
            <p role="status" className="text-sm leading-relaxed text-blue-3">تم إرسال طلب الشحن. يُحدّث رصيدك بعد تأكيد الدفع.</p>
            <Button className="h-13 w-full bg-blue-3 font-bold text-white" onClick={() => void refreshBalance()} disabled={refreshing}>{refreshing && <Loader2 className="size-4 animate-spin" />}تحديث الرصيد</Button>
          </> : <Button className="h-13 w-full rounded-lg bg-blue-3 text-base font-bold text-white shadow-[0_4px_6px_-4px_rgba(212,168,67,0.25)]" onClick={() => void checkout()} disabled={!selected || busy || packagesQuery.isFetching || packagesQuery.isError}>{purchase.isPending ? <Loader2 className="size-4 animate-spin" /> : <span className="order-last rotate-180"><TryOnIcon name="paymentArrow" /></span>}{purchase.isPending ? "جارٍ فتح الدفع..." : "احصل على الرصيد الآن"}</Button>}
          <p className="flex items-center justify-center gap-1.5 text-xs text-[#6a7282]"><TryOnIcon name="paymentLock" />تُستكمل عملية الدفع عبر بوابة الدفع</p>
        </div>
      </div>
      <div className="order-first flex items-center justify-center bg-[#3c5d80]/5 py-5 md:order-last md:min-h-140">
        <div className="relative h-32 w-35 overflow-hidden sm:h-40 sm:w-44 md:h-[281px] md:w-[307px]"><Image src="/virtual-try-on/261d3.png" alt="" width={580} height={317} className="absolute max-w-none" style={{ width: "188.91%", height: "112.89%", left: "-46.89%", top: "-5.78%" }} aria-hidden="true" /></div>
      </div>
    </div>
  </>;
}
