'use client';

import { GuideImageRow } from '../GuideImageRow';

const rows = [
    {
        image: '/images/service-store-help/s-a-1.webp',
        alt: 'مدة التنفيذ والتخصصات',
        text: 'يمكنك كتابة مدة تنفيذ الخدمة واختيار ساعة أو يوم أو أسبوع أو شهر\nحدد التخصصات أو مجالات العمل المرتبطة بخدمتك التي  تصف طبيعة خدمتك بدقة',
    },
    {
        image: '/images/service-store-help/s-a-2.webp',
        alt: 'الكلمات المفتاحية',
        text: 'الكلمات المفتاحية تساعدك في ظهور خدمتك عند البحث بإستخدام هذه الكلمة',
    },
    {
        image: '/images/service-store-help/s-a-3.webp',
        alt: 'التطويرات الاختيارية',
        text: 'يمكنك إضافة تطويرات اختيارية على خدمتك لتمكين العملاء من طلب مزايا إضافية مقابل تكلفة ومدة تنفيذ أعلى.\nعند تفعيل أي تطوير، سيظهر للعميل كخيار إضافي يمكنه إضافته أثناء طلب الخدمة',
    },
    {
        image: '/images/service-store-help/s-a-4.webp',
        alt: 'الأسئلة الشائعة',
        text: 'الأسئلة الشائعة\nالتي تستطيع فيها كتابة الأسئلة المتكررة حول الخدمة مع كتابة إجاباتها',
    },
];

export function AdvancedInfoStep() {
    return (
        <div className="w-full">
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-[#2D496A] mb-2">المعلومات المتقدمة</h2>
            <p className="text-xs md:text-sm lg:text-base text-[#2D496A] mb-6 md:mb-8">
                أضف المعلومات المتقدمة التي تساعد المشترين على فهم خدمتك بشكل أفضل.
            </p>

            <div className="flex flex-col gap-6 md:gap-8">
                {rows.map((row) => (
                    <GuideImageRow key={row.image} {...row} />
                ))}
            </div>
        </div>
    );
}
