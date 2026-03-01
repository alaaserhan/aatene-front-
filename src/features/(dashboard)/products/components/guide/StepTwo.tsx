'use client';

export default function StepTwo() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl">
                    1
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl">المعلومات الأساسية</h2>
                    <p className="text-[#5B7C93] text-xs md:text-sm lg:text-base mt-1">إضافة البيانات المطلوبة والتأكد من صحتها</p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[700px] mx-auto ">
                <img
                    src="/images/Frame2steptwo.webp"
                    alt="صفحة المنتج في الموقع"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame1step2.webp"
                    alt="لوحة التحكم - معلومات أساسية"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame4steptwo.webp"
                    alt="صفحة المنتج - تفاصيل المنتج"
                    className="absolute w-[36.4%] h-auto top-[56.4%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame3steptwo.webp"
                    alt="لوحة التحكم - حالة المنتج والوصف"
                    className="absolute w-[36.4%] h-auto top-[56.4%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/Arrow3step2.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[48.6%] h-[12.1%] top-[18.4%] right-[15%]"
                />

                <img
                    src="/Arrow2step2.png"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[56%] h-[20%] top-[18%] right-[27.9%]"
                />

                <img
                    src="/Arrow4step2.png"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[56.6%] h-[45.3%] top-[23%] right-[28.5%]"
                />




                <img
                    src="/Arrow1step2.png"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[4.3%] h-auto top-[58.8%] left-[88.9%]"
                />
                <p className="absolute text-[#5B7C93] text-xs leading-relaxed whitespace-nowrap top-[57.5%] left-[94%]">
                    تصنيف 
                    للمنتج 
                </p>

                <img
                    src="/Arrow1step2.png"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[5.8%] h-auto top-[93.5%] left-[89.8%]"
                />
                <p className="absolute text-[#5B7C93] text-xs leading-relaxed whitespace-nowrap top-[92%] left-[96.2%]">
                    الإنتقال<br />
                    للخطوة التالية
                </p>




                <img
                    src="/Arrow3(1)step2.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[15%] h-auto top-[61%] left-[57.3%] "
                />
                <p className="absolute text-[#5B7C93] text-xs leading-relaxed text-right whitespace-nowrap top-[60.5%] left-[45%]">
                    إختيار حالة المنتج إذا كان جديد أو<br />
                    مستعمل
                </p>
                <img
                    src="/Arrow5step2.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[32%] h-[16%] top-[76.8%] left-[39.3%] "
                />

            </div>
            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/images/Frame1step2.webp"
                            alt="لوحة التحكم - معلومات أساسية"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    </div>

                    <div className="flex flex-col gap-3 order-3 md:order-2">
                        <img
                            src="/images/Frame2steptwo.webp"
                            alt="صفحة المنتج في الموقع"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    </div>

                    <div className="flex flex-col gap-3 order-2 md:order-3">
                        <img
                            src="/images/Frame3steptwo.webp"
                            alt="لوحة التحكم - حالة المنتج والوصف"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <div className="text-[#5B7C93] text-xs text-center space-y-2">
                            <p>تصنيف للمنتج </p>
                            <p>ثم إختيار حالة المنتج إذا كان جديد أو مستعمل</p>
                            <p>ثم انتقل للخطوة التالية</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 order-4">
                        <img
                            src="/images/Frame4steptwo.webp"
                            alt="صفحة المنتج - تفاصيل المنتج"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
