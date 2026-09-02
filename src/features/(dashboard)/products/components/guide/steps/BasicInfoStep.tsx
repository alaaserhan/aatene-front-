'use client';

import { GuideImageRow } from '../GuideImageRow';

const rows = [
    {
        image: '/images/product-creation-help/p-1-1.webp',
        alt: 'عنوان وصور المنتج',
        text: 'اكتب عنوانًا جذابًا لمنتجك وأضف صورًا توضح ما تبيعة، مما يساعد المشترين على معرفة المنتج وزيادة فرص بيعه.',
    },
    {
        image: '/images/product-creation-help/p-1-2.webp',
        alt: 'سعر المنتج',
        text: 'يمكنك اختيار إظهار السعر وكتابة سعر المنتج أو اختيار لا أريد إظهار السعر ليظهر زر أطلب السعر بدلاً من السعر',
    },
    {
        image: '/images/product-creation-help/p-1-3.webp',
        alt: 'اختيار الفئة',
        text: 'يجب عليك اختيار الفئة المناسبة للمنتج حتى يستطيع المشتريين الوصول إليها بسهولة',
    },
    {
        image: '/images/product-creation-help/p-1-4.webp',
        alt: 'اختيار القسم',
        text: 'يمكنك أيضا اختيار القسم الذي ينتمي لة المنتج أو إضافة قسم جديد',
    },
    {
        image: '/images/product-creation-help/p-1-5.webp',
        alt: 'وصف المنتج',
        text: 'وصف كامل للمنتج يمكنك إضافة المميزات أيضا ليوضح جميع التفاصيل الخاصة بالمنتج',
    },
    {
        image: '/images/product-creation-help/p-1-6.webp',
        alt: 'الكلمات المفتاحية',
        text: 'الكلمات المفتاحية تساعدك في ظهور منتجك عند البحث بإستخدام هذه الكلمة',
    },
];

export function BasicInfoStep() {
    return (
        <div className="w-full">
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-[#2D496A] mb-2">المعلومات الأساسية</h2>
            <p className="text-xs md:text-sm lg:text-base text-[#2D496A] mb-6 md:mb-8">
                إضافة البيانات المطلوبة والتأكد من صحتها لضمان عرضها بشكل واضح وجذاب للمشترين.
            </p>

            <div className="flex flex-col gap-6 md:gap-8">
                {rows.map((row) => (
                    <GuideImageRow key={row.image} {...row} />
                ))}
            </div>
        </div>
    );
}
