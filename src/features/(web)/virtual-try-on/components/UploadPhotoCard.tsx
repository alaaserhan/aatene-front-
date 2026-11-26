"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { fixMediaUrl, cn } from "@/src/lib/utils";
import { TryOnIcon } from "./TryOnIcon";
import { downloadTryOnImage, shareTryOnImage } from "../media";

interface UploadPhotoCardProps {
  currentPhotoUrl?: string | null;
  onUpload: (file: File) => Promise<unknown>;
  isUploading?: boolean;
  className?: string;
}

export function UploadPhotoCard({ currentPhotoUrl, onUpload, isUploading = false, className }: UploadPhotoCardProps) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function upload(file?: File) {
    if (!file || isUploading) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024 || file.size === 0) {
      setError("يجب أن تكون الصورة غير فارغة، وألا يتجاوز حجمها 10 ميجابايت.");
      return;
    }
    setError("");
    try { await onUpload(file); } catch { /* The mutation displays the server error and keeps the saved photo. */ }
  }

  function change(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    void upload(file);
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files[0]);
  }

  return (
    <section className={cn("min-w-0 space-y-4", className)} aria-labelledby="try-on-photo-title">
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={change} aria-label="اختيار صورة التجربة" className="sr-only" disabled={isUploading} />
      <div className="flex min-h-13 items-center justify-between gap-3">
        <h2 id="try-on-photo-title" className="text-lg font-bold text-[#17263a] sm:text-xl">صورتك للتجربة</h2>
        <Button type="button" variant="outline" className="h-13 rounded-lg border-[#cad5e2] bg-white px-4 text-sm font-bold text-blue-3 hover:bg-slate-50 sm:h-13 sm:px-5 sm:text-base" onClick={() => input.current?.click()} disabled={isUploading}>
          <TryOnIcon name="change" /> تغيير الصورة
        </Button>
      </div>
      <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}
        className={cn("relative isolate flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f8fafc]", currentPhotoUrl ? "aspect-[553/594] shadow-[0_8px_10px_rgba(16,34,53,0.12)]" : "min-h-105 border border-dashed border-[#d9e3f0] md:aspect-[553/594]", dragging && "ring-2 ring-blue-3")} aria-busy={isUploading}>
        {currentPhotoUrl ? (
          <>
            <Image src={fixMediaUrl(currentPhotoUrl)} alt="صورتك المحفوظة للتجربة" fill sizes="(max-width: 767px) 90vw, 40vw" className="object-cover" unoptimized priority />
            <div className="absolute start-4 top-4 flex gap-2" dir="ltr">
              <Button type="button" variant="ghost" size="icon" className="rounded-lg bg-white/90 hover:bg-white" aria-label="مشاركة صورتك" onClick={() => void shareTryOnImage(currentPhotoUrl)}><TryOnIcon name="share" /></Button>
              <Button type="button" variant="ghost" size="icon" className="rounded-lg bg-white/90 hover:bg-white" aria-label="تنزيل صورتك" onClick={() => void downloadTryOnImage(currentPhotoUrl, "aatene-photo.png")}><TryOnIcon name="download" /></Button>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center gap-5 px-5 py-10 text-center">
            <span className="flex size-22 items-center justify-center rounded-full bg-[#edf3f8]"><TryOnIcon name="photo" /></span>
            <h3 className="text-xl font-bold text-[#17263a] sm:text-2xl">أضف صورتك لتبدأ التجربة</h3>
            <p className="max-w-80 text-sm leading-relaxed text-c2-slate-550">منتجك جاهز. ارفع صورة أمامية واضحة لتشاهد كيف يبدو عليك قبل الشراء.</p>
            <Button type="button" className="h-13 bg-blue-3 px-5 font-bold text-white" onClick={() => input.current?.click()} disabled={isUploading}><TryOnIcon name="upload" /> رفع صورة شخصية</Button>
            <p className="text-xs leading-relaxed text-c2-slate-550">اسحب الصورة هنا أو اخترها من جهازك<br /><bdi>JPG، PNG، WEBP</bdi> · حتى 10 ميجابايت</p>
          </div>
        )}
        {isUploading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/85 text-blue-3" role="status"><Loader2 className="size-9 animate-spin" /><p>جارٍ رفع الصورة...</p></div>}
      </div>
      {error && <p role="alert" className="text-sm text-c2-danger">{error}</p>}
      <p className="text-xs leading-relaxed text-c2-slate-550">تُستخدم صورتك لإنشاء التجربة فقط.</p>
      <Accordion type="single" collapsible className="rounded-xl border border-[#d9e3f0] px-4">
        <AccordionItem value="photo-guide" className="border-0">
          <AccordionTrigger className="py-4 text-start hover:no-underline">
            <span className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf3f8]"><TryOnIcon name="settings" /></span><span><span className="block font-bold text-[#17263a]">إرشادات صورة التجربة</span><span className="mt-1 block text-xs font-normal text-c2-slate-550">للحصول على نتيجة أوضح</span></span></span>
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-7 text-c2-slate-550">استخدم صورة أمامية تُظهر الجسم بوضوح، بإضاءة جيدة وخلفية بسيطة، وتجنب الصور الضبابية أو التي يظهر فيها أكثر من شخص.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
