'use client';

export default function StepFive() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl leading-[1] pt-0.5">
                    4
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl">منتجات مرتبطة</h2>
                    <p className="text-[#2D496A] text-xs md:text-sm lg:text-base mt-1">إضافة البيانات المطلوبة والتأكد من صحتها</p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[800px] mx-auto ">
                <img
                    src="/images/Frame1step5.webp"
                    alt="منتجات مرتبطة - يمين أعلى"
                    className="absolute w-[36.4%] h-auto top-[3%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame2step5.webp"
                    alt="منتجات مرتبطة - يسار أعلى"
                    className="absolute w-[36.4%] h-auto top-[3%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame3step5.webp"
                    alt="منتجات مرتبطة - يمين أسفل"
                    className="absolute w-[36.4%] h-auto top-[58.4%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame4step5.webp"
                    alt="منتجات مرتبطة - يسار أسفل"
                    className="absolute w-[36.4%] h-auto top-[58.4%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />
                <img
                    src="/Arrow1stepthree.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[34.5%] h-auto top-[77%] left-[37%]"
                />

                <img
                    src="/Arrow1step5.svg"
                    alt="arrow"
                    className="absolute w-[45.8%] h-[10%] top-[12.3%] left-[39.6%]"
                    loading="lazy"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[8.5%] left-[93.6%] max-w-[5.3%] leading-tight">
                 المنتجات المرتبطة هي منتجات لها علاقة ببعضها البعض ويمكنك إضافة العروض عليهم
                </p>

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[47.5%] left-[10%] max-w-[45.3%] leading-tight">
                 بعد اختيار المنتجات يمكنك الضغط علي تأكيد للانتقال للخطوة التالية 
                </p>

                <img
                    src="/Arrow2step5.svg"
                    alt="arrow"
                    className="absolute w-[53.5%] h-auto top-[29.5%] right-[22.7%]"
                    loading="lazy"
                />

                <img
                    src="/Arrow3step5.svg"
                    alt="arrow"
                    className="absolute w-[5.8%] h-auto top-[91%] right-[4.5%]"
                    loading="lazy"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[89%] left-[93.6%] max-w-[5.3%] leading-tight">
                    إضافة المنتج للمراجعة
                </p>


                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[98%] left-[10.6%] max-w-[55.3%] ">
                   هذا هو المقصود بالمنتجات المرتبطة انها منتجات نضع عليها<br/> تخفيض مع بعضها البعض لأنهم لهم علاقة ببعضهم البعض
                </p>
                
            </div>

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/images/Frame1step5.webp"
                            alt="منتجات مرتبطة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> المنتجات المرتبطة هي منتجات لها علاقة ببعضها البعض ويمكنك إضافة العروض عليهم </p>
                    </div>

                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/images/Frame2step5.webp"
                            alt="منتجات مرتبطة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> بعد اختيار المنتجات يمكنك الضغط علي تأكيد للانتقال للخطوة التالية </p>
                    </div>

                    <div className="flex flex-col gap-3 order-3">
                        <img
                            src="/images/Frame3step5.webp"
                            alt="منتجات مرتبطة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> إضافة المنتج للمراجعة </p>
 
                    </div>

    
                    <div className="flex flex-col gap-3 order-4">
                        <img
                            src="/images/Frame4step5.webp"
                            alt="منتجات مرتبطة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> هذا هو المقصود بالمنتجات المرتبطة انها منتجات نضع عليها تخفيض مع بعضها البعض لأنهم لهم علاقة ببعضهم البعض </p>
 
                    </div>
                </div>
            </div>
        </div>
    );
}
