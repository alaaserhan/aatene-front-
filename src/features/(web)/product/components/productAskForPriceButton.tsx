import { cn } from "@/src/lib/utils";

/** شكل زر «اطلب السعر» الموحّد (بطاقة البحث، صفحة المنتج، إلخ) */
export const productAskForPriceButtonClassName = cn(
    "inline-flex h-9 px-5 rounded-sm bg-blue-4 text-white text-sm font-medium items-center justify-center",
    "cursor-pointer select-none touch-manipulation",
    "transition-[transform,filter,box-shadow] duration-150 ease-out",
    "hover:brightness-110 hover:shadow-md",
    "active:scale-[0.97] active:brightness-95 active:shadow-inner",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-4)]"
);
