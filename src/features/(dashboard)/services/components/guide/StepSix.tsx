'use client';

export default function StepSix() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl">
                    5
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl"> مراجعة</h2>
                    <p className="text-[#5B7C93] text-xs md:text-sm lg:text-base mt-1">إضافة البيانات المطلوبة والتأكد من صحتها</p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[500px] mx-auto ">

                <img
                    src="/images/Frame1step66.webp"
                    alt=" مراجعة - يمين أعلى"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[31.4%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/Arrow1step66.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[4%] h-auto top-[45.5%] left-[63%]"
                />

               

                <p className="absolute text-[#5B7C93] text-xs leading-relaxed text-right top-[44%] left-[66.7%] max-w-[10%]">
                  سيتم نشر الخدمة عند الموافقة عليها من فريق أعطيني المختص  </p>
            
            </div>

               

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/images/Frame1step66.webp"
                            alt=" مراجعة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                         <p className="text-xs md:text-sm text-[#5B7C93] font-medium text-center"> سيتم نشر الخدمة عند الموافقة عليها من فريق أعطيني المختص  </p>
                    </div>             
                </div>
            </div>
        </div>
    );
}
