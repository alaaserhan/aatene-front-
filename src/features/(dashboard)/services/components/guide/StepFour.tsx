'use client';

export default function StepFour() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl leading-[1] pt-0.5">
                    3
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl">صور الخدمة</h2>
                    <p className="text-[#2D496A] text-xs md:text-sm lg:text-base mt-1">إضافة البيانات المطلوبة والتأكد من صحتها</p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[400px] mx-auto ">
                <img
                    src="/guide-images/Frame2step44.webp"
                    alt="صور الخدمة - يسار"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/guide-images/Frame1step44.webp"
                    alt="صور الخدمة - يمين"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/guide-images/Arrow1step44.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[46.2%] h-auto top-[18%] left-[38%] "
                />

                <img
                    src="/guide-images/Arrow2step44.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[9.7%] h-[35%] top-[50.1%] left-[88%] "
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium leading-relaxed text-right top-[87.3%] left-[67.5%] max-w-[35.1%]">
                    أضف عدة صور لتوضيح خدمتك، واختر صورة أساسية لأنها ستكون الصورة الظاهرة للمستخدم عند تصفح الخدمات.
                </p>
            </div>

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/guide-images/Frame1step44.webp"
                            alt="صور الخدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center">  أضف عدة صور لتوضيح خدمتك، واختر صورة أساسية لأنها ستكون الصورة الظاهرة للمستخدم عند تصفح الخدمات. </p>

                    </div>

                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/guide-images/Frame2step44.webp"
                            alt="صور الخدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        
                    </div>

                </div>
            </div>
        </div>
    );
}
