"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import { useUpdateCategoryDressable } from "../hooks";

interface DressableToggleProps {
  categoryId: number;
  isSubCategory: boolean;
  initialValue: boolean;
  className?: string;
  variant?: "row" | "field";
}

export function DressableToggle({ categoryId, isSubCategory, initialValue, className, variant = "row" }: DressableToggleProps) {
  const id = useId();
  const isAdmin = useAuthStore((state) => state.user?.user_type === "admin");
  const update = useUpdateCategoryDressable();
  const [saved, setSaved] = useState(initialValue);
  if (!isSubCategory || !isAdmin) return null;
  const checked = update.isPending ? update.variables.isDressable : saved;
  return (
    <div className={cn("flex min-w-0 items-center gap-3 py-2", variant === "field" ? "w-full flex-row-reverse justify-between" : "ms-2 sm:ms-6 sm:gap-4", className)}>
      <div dir="rtl" className="flex shrink-0"><ToggleSwitch id={id} enabled={checked} onChange={(isDressable) => update.mutate({ categoryId, isDressable }, { onSuccess: () => setSaved(isDressable) })} disabled={update.isPending} /></div>
      <Label htmlFor={id} dir="rtl" className="cursor-pointer text-sm font-medium text-gray-2">تفعيل نظام التلبيس</Label>
      {update.isPending && <Loader2 className="size-3.5 shrink-0 animate-spin text-blue-3" />}
    </div>
  );
}
