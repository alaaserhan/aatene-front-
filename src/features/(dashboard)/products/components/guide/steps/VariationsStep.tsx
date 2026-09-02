'use client';

import { GuideImageRow } from '../GuideImageRow';

const rows = [
    {
        image: '/images/product-creation-help/p-2-1.webp',
        alt: 'إضافة سمة',
        text: 'في حالة وجود اختلافات من المنتج يمكنك الضغط على نعم ثم الضغط على إضافة سمة حتى تبدأ في اختيار سمات منتجك',
    },
    {
        image: '/images/product-creation-help/p-2-2.webp',
        alt: 'أسعار وصور القيم',
        text: 'يمكنك بعد ذلك إضافة السعر والصور لكل قيمة كما يمكنك أيضا اضافة قيمة غير موجودة',
    },
];

export function VariationsStep() {
    return (
        <div className="w-full">
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-[#2D496A] mb-2">الإختلافات</h2>
            <p className="text-xs md:text-sm lg:text-base text-[#2D496A] mb-6 md:mb-8">
                هي نسخ مختلفة من نفس المنتج تختلف في سمات معينة مثل الحجم أو اللون.
            </p>

            <div className="flex flex-col gap-6 md:gap-8">
                {rows.map((row) => (
                    <GuideImageRow key={row.image} {...row} />
                ))}
            </div>
        </div>
    );
}
