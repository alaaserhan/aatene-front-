'use client';

export default function StepOne() {
    return (
        <div className="w-full">
            <h2 className="text-base md:text-lg font-semibold text-[#2D496A] mb-2">في حالة لا توجد أي أقسام مفتوحة</h2>
            <p className="text-xs md:text-sm text-[#6B7C93] mb-6 md:mb-8">من لوحة التحكم يمكنك الضغط علي إضافة أقسام جديدة لمتجرك</p>
            
            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[400px] mx-auto ">
                <img
                    src="/images/Frame1step1.webp"
                    alt="صفحة المتجر"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame2step1.webp"
                    alt="لوحة التحكم"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/Arrow1.png"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[20.1%] h-auto top-[37%] left-[40%]"
                />

                <p className="absolute text-[#5B7C93] text-sm font-medium text-center top-[89.2%] left-[65%] w-[20.9%]">
                    الضغط علي إضافة قسم جديد لمتجرك
                </p>

                <p className="absolute text-[#5B7C93] text-sm font-medium text-center top-[89.2%] left-[9%] w-[32.6%]">
                    هنا في صفحة المتجر سوف تجد الأقسام الخاصة بك كما هو موضح <br/> بالشكل مع عدد المنتجات داخل كل قسم
                </p>


            </div>

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/images/Frame1step1.webp"
                            alt="صفحة المتجر"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#5B7C93] font-medium text-center">الضغط علي إضافة قسم جديد لمتجرك</p>
                    </div>

                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/images/Frame2step1.webp"
                            alt="لوحة التحكم"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#5B7C93] font-medium text-center"> هنا في صفحة المتجر سوف تجد الأقسام الخاصة بك كما هو موضح بالشكل مع عدد المنتجات داخل كل قسم </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
