'use client';

export default function StepThree() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl leading-[1] pt-0.5">
                    2
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl">سعر الخدمة</h2>
                    <p className="text-[#2D496A] text-xs md:text-sm lg:text-base mt-1">إضافة البيانات المطلوبة والتأكد من صحتها</p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[750px] mx-auto ">
                <img
                    src="/images/Frame4step33.webp"
                    alt="سعر الخدمة - يسار"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame1step33.webp"
                    alt="سعر الخدمة - يمين"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame3step33.webp"
                    alt="سعر الخدمة - وسط أسفل"
                    className="absolute w-[36.4%] h-auto top-[57%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />
                                
                <img
                    src="/images/Frame4step33.webp"
                    alt="سعر الخدمة - وسط أسفل"
                    className="absolute w-[36.4%] h-auto top-[57%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/Arrow1step33.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[6.5%] h-auto top-[30%] right-[4%]"
                />

                <img
                    src="/Arrow2step33.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[54.8%] h-auto top-[1%] left-[16.6%] "
                />

                <img
                    src="/Arrow2step33.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[54.8%] h-auto top-[51.8%] left-[16.6%] "
                />

                <img
                    src="/Arrow3step33.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[4.1%] h-auto top-[86.5%] right-[6.8%]"
                />

                <img
                    src="/Arrow4step33.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[5.1%] h-auto top-[89.9%] right-[5.8%]"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium leading-relaxed text-right top-[48%] left-[70.8%] max-w-[29.9%]">
                    يمكنك إضافة تطويرات اختيارية على خدمتك لتمكين العملاء من طلب مزايا إضافية مقابل تكلفة ومدة تنفيذ أعلى. <br/>عند تفعيل أي تطوير، سيظهر للعميل كخيار إضافي يمكنه إضافته أثناء طلب الخدمة
                </p>

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium leading-relaxed whitespace-nowrap top-[85.5%] left-[94%] ">
                    أضف تطوير جديد
                </p>

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium leading-relaxed whitespace-nowrap top-[100%] right-[2%] ">
                    اﻹنتقال للخطوة التالية
                </p>


                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium leading-relaxed whitespace-nowrap top-[100%] left-[10%] ">
                   هذه هي التطويرات الخاصة بكل خدمة مع السعر الخاص بها مع المدة أيضا 
                </p>
            </div>

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/images/Frame1step33.webp"
                            alt="سعر الخدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />

                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center">  يمكنك إضافة تطويرات اختيارية على خدمتك لتمكين العملاء من طلب مزايا إضافية مقابل تكلفة ومدة تنفيذ أعلى. عند تفعيل أي تطوير، سيظهر للعميل كخيار إضافي يمكنه إضافته أثناء طلب الخدمة</p>

                    </div>
                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/images/Frame4step33.webp"
                            alt="سعر الخدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    </div>

                    <div className="flex flex-col gap-3 order-3 md:col-span-2">
                        <img
                            src="/images/Frame3step33.webp"
                            alt="سعر الخدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center">  أضف تطوير جديد ثم اضغط حفظ والتالي للإنتقال للخطوة التالية</p>

                    </div>

                    <div className="flex flex-col gap-3 order-3 md:col-span-2">
                        <img
                            src="/images/Frame4step33.webp"
                            alt="سعر الخدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> هذه هي التطويرات الخاصة بكل خدمة مع السعر الخاص بها مع المدة أيضا  </p>

                    </div>
                </div>
            </div>
        </div>
    );
}
