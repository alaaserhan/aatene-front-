// src/features/(dashboard)/services/components/form/fields/PriceVisibilityField.tsx
"use client";

import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

interface PriceVisibilityFieldProps {
  askForPrice: boolean;
  price: number | string;
  error?: string;
  onAskForPriceChange: (askForPrice: boolean) => void;
  onPriceChange: (price: string) => void;
}

/**
 * Price visibility choice: "show price" (with the price input) or "don't show price".
 * The price value is kept when toggling; only the input is hidden when "don't show" is chosen.
 */
export function PriceVisibilityField({
  askForPrice,
  price,
  error,
  onAskForPriceChange,
  onPriceChange,
}: PriceVisibilityFieldProps) {
  return (
    <div className="space-y-2" id="price">
      <Label className="text-sm font-medium flex items-center gap-1">
        اختر طريقة ظهور سعر خدمتك! <span className="text-red-500">*</span>
      </Label>

      <div className="space-y-3">
        {/* Show price */}
        <button
          type="button"
          onClick={() => onAskForPriceChange(false)}
          className={cn(
            "w-full border rounded-sm p-3 text-right transition-colors",
            !askForPrice ? "border-blue-4 bg-[#EEF3FB]" : "border-gray-200 bg-[#F8F8F8]"
          )}
        >
          <div className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                !askForPrice ? "border-blue-4" : "border-gray-400"
              )}
              aria-hidden
            >
              {!askForPrice && <span className="w-2 h-2 rounded-full bg-blue-4" />}
            </span>
            <span className={cn("text-right", !askForPrice ? "text-blue-4" : "text-gray-700")}>
              إظهار السعر
            </span>
          </div>

          {!askForPrice && (
            <div
              className={cn(
                "mt-3 flex h-12 min-w-0 items-center gap-2 rounded-lg border bg-white px-3 transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100",
                error ? "border-red-500" : "border-gray-200"
              )}
              dir="ltr"
            >
              <span className="shrink-0 text-2xl font-bold leading-none text-gray-900" aria-hidden>
                ₪
              </span>
              <Input
                name="price"
                type="number"
                min="0"
                inputMode="decimal"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-left text-sm text-gray-900 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="0.00"
              />
            </div>
          )}
        </button>

        {/* Don't show price */}
        <button
          type="button"
          onClick={() => onAskForPriceChange(true)}
          className={cn(
            "w-full border rounded-sm p-3 text-right transition-colors",
            askForPrice ? "border-blue-4 bg-[#EEF3FB]" : "border-gray-200 bg-[#F8F8F8]"
          )}
        >
          <div className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                askForPrice ? "border-blue-4" : "border-gray-400"
              )}
              aria-hidden
            >
              {askForPrice && <span className="w-2 h-2 rounded-full bg-blue-4" />}
            </span>
            <span className={cn("text-right", askForPrice ? "text-blue-4" : "text-gray-700")}>
              لا اريد اظهار السعر
            </span>
          </div>
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
