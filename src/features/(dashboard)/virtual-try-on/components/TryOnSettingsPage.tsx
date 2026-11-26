"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useLanguage } from "@/src/hooks/use-language";
import { getTryOnError } from "@/src/features/(web)/virtual-try-on/errors";
import { useAdminTryOnSettings, useSaveTryOnSettings } from "../hooks";
import type { TryOnSettings } from "../types";

export function TryOnSettingsPage() {
  const locale = useLanguage();
  const query = useAdminTryOnSettings();
  const save = useSaveTryOnSettings();
  const [activeDraft, setActiveDraft] = useState<boolean>();
  const [costDraft, setCostDraft] = useState<string>();
  const [validation, setValidation] = useState("");
  const active = activeDraft ?? query.data?.is_try_on_active ?? false;
  const cost = costDraft ?? String(query.data?.try_on_coins_per_generation ?? "");
  const dirty = !!query.data && (active !== query.data.is_try_on_active || cost !== String(query.data.try_on_coins_per_generation));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(cost);
    if (!/^\d+$/.test(cost) || !Number.isSafeInteger(amount)) {
      setValidation("أدخل عددًا صحيحًا من العملات يساوي صفرًا أو أكثر.");
      return;
    }
    setValidation("");
    if (!query.data || !dirty) return;
    const patch: Partial<TryOnSettings> = {};
    if (active !== query.data.is_try_on_active) patch.is_try_on_active = active;
    if (amount !== query.data.try_on_coins_per_generation) patch.try_on_coins_per_generation = amount;
    try {
      await save.mutateAsync(patch);
      setActiveDraft(undefined);
      setCostDraft(undefined);
    } catch {
      // The mutation displays the server validation message.
    }
  }

  return (
    <div dir="rtl" className="min-h-full bg-[#f5f5f5] px-4 py-6 sm:px-8 lg:px-20">
      <Button asChild variant="ghost" className="mb-5 text-blue-3"><Link href={`/${locale}/admin/settings`}><ArrowRight className="size-4" />العودة إلى إعدادات النظام</Link></Button>
      <section className="mx-auto max-w-320 rounded-[10px] border border-[#dedfe1] bg-white p-5 sm:p-8">
        <header className="space-y-3 border-b border-[#dedfe1] pb-5">
          <h1 className="text-2xl font-medium text-[#3d3d3d]">نظام التلبيس الافتراضي</h1>
          <p className="text-sm leading-relaxed text-[#737373] sm:text-base">عند الإيقاف، لن يتمكن المستخدمون من تجربة المنتجات على أنفسهم.</p>
        </header>
        {query.isLoading ? <div className="grid min-h-60 place-items-center" role="status"><Loader2 className="size-8 animate-spin text-blue-3" /><span className="sr-only">جارٍ تحميل الإعدادات</span></div> : query.isError ? <div className="space-y-4 py-8" role="alert"><p>{getTryOnError(query.error, "تعذر تحميل الإعدادات.")}</p><Button onClick={() => void query.refetch()}>إعادة المحاولة</Button></div> : query.data && (
          <form onSubmit={submit} className="space-y-6 pt-5">
            <fieldset disabled={save.isPending} className="space-y-6">
              <div className="space-y-3 p-2">
                <legend className="mb-3 text-lg font-medium text-[#393939]">تفعيل نظام التلبيس</legend>
                {[{ label: "نعم", value: true }, { label: "لا", value: false }].map((option) => <label key={String(option.value)} className="flex w-fit cursor-pointer items-center gap-4 text-base"><input type="radio" name="is_try_on_active" checked={active === option.value} onChange={() => setActiveDraft(option.value)} className="size-5 accent-[#2d496a]" />{option.label}</label>)}
              </div>
              <div className="space-y-4 rounded-[10px] border border-[#e3e3e3] px-5 py-6">
                <Label htmlFor="try-on-cost" className="text-lg font-medium text-[#393939]">تكلفة توليد الصورة</Label>
                <p id="try-on-cost-help" className="text-sm leading-relaxed text-[#737373]">عدد العملات المخصومة مقابل كل صورة. أدخل صفرًا لإتاحة التجربة مجانًا.</p>
                <Input id="try-on-cost" type="number" inputMode="numeric" min={0} step={1} value={cost} onChange={(event) => { setCostDraft(event.target.value); setValidation(""); }} aria-describedby="try-on-cost-help" aria-invalid={!!validation} className="h-11 rounded border-[#e3e3e3] font-digits" dir="ltr" />
                {validation && <p role="alert" className="text-sm text-c2-danger">{validation}</p>}
              </div>
            </fieldset>
            <div className="flex flex-wrap justify-end gap-3">
              {dirty && <Button type="button" variant="outline" disabled={save.isPending} onClick={() => { setActiveDraft(undefined); setCostDraft(undefined); setValidation(""); }}>إلغاء التغييرات</Button>}
              <Button type="submit" disabled={!dirty || save.isPending} className="h-12 min-w-56 rounded-full bg-blue-3 font-bold text-white">{save.isPending && <Loader2 className="size-4 animate-spin" />}{save.isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
