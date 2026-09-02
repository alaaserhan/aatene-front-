'use client';

import { GuideImageRow } from '../GuideImageRow';

const rows = [
    {
        image: '/images/service-store-help/s-m-1.webp',
        alt: 'عنوان وصور الخدمة',
        text: 'اكتب عنوانًا جذابًا لخدمتك وأضف صورًا توضح ما تقدمه، مما يساعد المشترين على فهم الخدمة وزيادة فرص طلبها.',
    },
    {
        image: '/images/service-store-help/s-m-2.webp',
        alt: 'اختيار الفئة',
        text: 'يجب عليك اختيار الفئة المناسبة للخدمة حتى يستطيع المشتريين الوصول إليها بسهولة',
    },
    {
        image: '/images/service-store-help/s-m-3.webp',
        alt: 'اختيار القسم',
        text: 'يمكنك أيضا اختيار القسم الذي تنتمي لة الخدمة أو إضافة قسم جديد',
    },
    {
        image: '/images/service-store-help/s-m-4.webp',
        alt: 'سعر الخدمة',
        text: 'يمكنك اختيار إظهار السعر وكتابة سعر الخدمة أو اختيار لا أريد إظهار السعر ليظهر زر أطلب السعر بدلاً من السعر',
    },
    {
        image: '/images/service-store-help/s-m-5.webp',
        alt: 'وصف الخدمة',
        text: 'وصف كامل للخدمة يمكنك إضافة المميزات أيضا ليوضح جميع التفاصيل الخاصة بالخدمة',
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
