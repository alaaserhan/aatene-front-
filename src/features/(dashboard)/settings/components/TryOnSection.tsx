"use client";

import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

export interface TryOnSectionData {
  isTryOnActive: boolean;
  coinsPerGeneration: string;
}

interface TryOnSectionProps {
  data: TryOnSectionData;
  onChange: (data: Partial<TryOnSectionData>) => void;
  disabled?: boolean;
}

export function TryOnSection({ data, onChange, disabled }: TryOnSectionProps) {
  return (
    <fieldset disabled={disabled} className="space-y-6">
      <div className="space-y-4">
        <p id="try-on-active-label" className="text-lg font-bold text-brand-black-1">تفعيل نظام التلبيس</p>
        <div role="radiogroup" aria-labelledby="try-on-active-label" className="flex flex-col items-start gap-4">
          {[{ label: "نعم", value: true }, { label: "لا", value: false }].map((option) => (
            <label key={String(option.value)} className="group flex cursor-pointer items-center gap-2">
              <input type="radio" name="isTryOnActive" checked={data.isTryOnActive === option.value} onChange={() => onChange({ isTryOnActive: option.value })} className="size-4 accent-blue-3" />
              <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-3">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Label htmlFor="try-on-settings-cost" className="text-lg font-bold text-brand-black-1">تكلفة توليد الصورة</Label>
        <p id="try-on-settings-cost-help" className="text-sm text-gray-2">عدد العملات المخصومة مقابل كل صورة. أدخل صفرًا لإتاحة التجربة مجانًا.</p>
        <Input id="try-on-settings-cost" type="number" inputMode="numeric" min={0} step={1} value={data.coinsPerGeneration} onChange={(event) => onChange({ coinsPerGeneration: event.target.value })} aria-describedby="try-on-settings-cost-help" dir="ltr" className="h-11 max-w-60 bg-white font-digits" />
      </div>
    </fieldset>
  );
}
