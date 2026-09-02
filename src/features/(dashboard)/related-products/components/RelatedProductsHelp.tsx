// src/features/(dashboard)/related-products/components/RelatedProductsHelp.tsx
import Image from "next/image";
import { cn } from "@/src/lib/utils";

const HELP_IMAGE = {
    src: "/images/related-products-help.webp",
    width: 1280,
    height: 277,
};

interface RelatedProductsHelpProps {
    className?: string;
}

/** Explains the offer flow — shown in place of the table while there are no offers. */
export function RelatedProductsHelp({ className }: RelatedProductsHelpProps) {
    return (
        <div className={cn("flex flex-col items-start text-start", className)}>
            <h3 className="text-lg font-bold text-c2-primary">
                كيفية إضافة منتجات مرتبطة؟
            </h3>
            <p className="mt-2 text-sm text-c2-slate-600">
                اختر المنتج، حدد سعر المجموعة، ثم احفظ العرض.
            </p>
            <Image
                src={HELP_IMAGE.src}
                width={HELP_IMAGE.width}
                height={HELP_IMAGE.height}
                alt="خطوات إضافة عرض منتجات مرتبطة"
                className="mt-6 h-auto w-full"
                priority={false}
            />
        </div>
    );
}
