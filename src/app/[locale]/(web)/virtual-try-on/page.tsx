import { TryOnPageClient } from "@/src/features/(web)/virtual-try-on/components/TryOnPageClient";
import { Suspense } from "react";

export const metadata = {
  title: "التجربة الافتراضية — أعطيني",
  description: "جرّب ملابسك قبل شرائها بتقنية الذكاء الاصطناعي",
};

export default function VirtualTryOnPage() {
  return <Suspense fallback={<div className="min-h-96 p-8 text-center" role="status">جارٍ تحميل غرفة التجربة...</div>}><TryOnPageClient /></Suspense>;
}
