// src/features/(dashboard)/related-products/components/RelatedProductsHelp.tsx
import { cn } from "@/src/lib/utils";
import { OfferBundlePreview, type BundleProduct } from "./OfferBundlePreview";

const MAIN_PRODUCT: BundleProduct = {
    name: "فستان أسود",
    price: 320,
    imageUrl: "/images/related-products/black-dress.png",
};

const RELATED_PRODUCTS: BundleProduct[] = [
    { name: "شنطة", price: 180, imageUrl: "/images/related-products/bag.png" },
    { name: "نضارة شمسية", price: 140, imageUrl: "/images/related-products/sun-glasses.png" },
    { name: "حذاء بكعب", price: 230, imageUrl: "/images/related-products/black-shoes.png" },
];

const ORIGINAL_TOTAL = RELATED_PRODUCTS.reduce(
    (total, product) => total + Number(product.price),
    0
);
const OFFER_TOTAL = 420;

interface RelatedProductsHelpProps {
    className?: string;
}

/** Read-only step header: badge + label. */
function StepHeader({ number, label }: { number: number; label: string }) {
    return (
        <div className="flex shrink-0 items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-c2-navy-900 text-[10px] font-bold text-white">
                {number}
            </span>
            <span className="whitespace-nowrap text-sm font-medium text-c2-neutral-800">
                {label}
            </span>
        </div>
    );
}

/** Both connectors share the leftover space equally, so they stay the same length. */
function StepConnector() {
    return <span className="mx-4 h-px flex-1 bg-c2-neutral-200" />;
}

/** Explains the offer flow — shown in place of the table while there are no offers. */
export function RelatedProductsHelp({ className }: RelatedProductsHelpProps) {
    return (
        <div className={cn("flex flex-col items-start text-start", className)}>
            <h3 className="text-lg font-bold text-c2-primary">كيفية إضافة منتجات مرتبطة؟</h3>
            <p className="mt-2 text-sm text-c2-slate-600">
                اختر المنتج، حدد سعر المجموعة، ثم احفظ العرض.
            </p>

            {/* One read-only row: each step sits above its own example. */}
            <div className="mt-6 w-full overflow-x-auto no-scrollbar rounded-lg bg-c2-slate-50 p-4 md:p-6">
                <div className="flex w-max flex-col gap-5">
                    {/* One strip across the whole row, so the connectors match each other. */}
                    <div className="flex items-center">
                        <StepHeader number={1} label="اختر المنتج" />
                        <StepConnector />
                        <StepHeader number={2} label="اختر المنتجات المرتبطة" />
                        <StepConnector />
                        <StepHeader number={3} label="اختر الخصم" />
                    </div>

                    <OfferBundlePreview
                        mainProduct={MAIN_PRODUCT}
                        relatedProducts={RELATED_PRODUCTS}
                        originalPrice={ORIGINAL_TOTAL}
                        offerPrice={OFFER_TOTAL}
                    />
                </div>
            </div>
        </div>
    );
}
