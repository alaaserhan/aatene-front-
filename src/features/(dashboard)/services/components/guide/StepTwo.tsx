'use client';

export default function StepTwo() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl">
                    1
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl">المعلومات الاساسية</h2>
                    <p className="text-[#5B7C93] text-xs md:text-sm lg:text-base mt-1">إضافة البيانات المطلوبة والتأكد من صحتها</p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[700px] mx-auto ">
                <img
                    src="/images/Frame2step22.webp"
                    alt="التصنيفات - يسار"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame1step22.webp"
                    alt="التصنيفات - يمين"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[55.9%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame3step22.webp"
                    alt="التصنيفات - وسط أسفل"
                    className="absolute w-[36.4%] h-auto top-[55%] left-[55.9%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame4step22.webp"
                    alt="التصنيفات - وسط أسفل"
                    className="absolute w-[36.4%] h-auto top-[55%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/Arrow1step22.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[5.1%] h-auto top-[21.5%] left-[87%]"
                />

                <img
                    src="/Arrow2step22.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[54.8%] h-[30%] top-[1.2%] left-[17.1%]  "
                />

                <img
                    src="/Arrow3step22.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[4.1%] h-auto top-[32.3%] left-[87.8%]"
                />

                <img
                    src="/Arrow4step22.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[16.3%] h-auto top-[39.5%] left-[54.8%] "
                />




                <img
                    src="/Arrow5step22.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[5.7%] h-auto top-[75.8%] left-[87.5%]"
                />

                <img
                    src="/Arrow6step22.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[50.7%] h-auto top-[85.5%] left-[21.5%]"
                />

                <p className="absolute text-[#5B7C93] text-xs leading-relaxed text-right top-[20.5%] left-[92.9%] whitespace-nowrap">
                    التصنيف الرئيسي
                </p>

                <p className="absolute text-[#5B7C93] text-xs leading-relaxed text-right top-[30%] left-[92.9%] max-w-[5.5%]">
                    تصنيف رئيسي للخدمة مثل (خدمات مالية  -خدمات صحية -....) وهكذا 
                </p>

                <p className="absolute text-[#5B7C93] text-xs leading-relaxed text-right top-[37%] left-[46.7%] max-w-[6.7%]">
                       القسم الذي تنتمي له الخدمة كما يمكنك أيضا إضافة قسم من هنا 
                </p>

                
                <p className="absolute text-[#5B7C93] text-xs leading-relaxed  top-[74.8%] left-[93%] max-w-[100px]">
                    تخصصات العمل التي يمكن لصاحب الخدمة القيام بها  
                </p>

            </div>

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/images/Frame1step22.webp"
                            alt="التصنيفات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#5B7C93] font-medium text-center"> التصنيف الرئيسي اسفله تجد تصنيف رئيسي للخدمة مثل (خدمات مالية  -خدمات صحية -....) وهكذا - اسفله تجد القسم الذي تنتمي له الخدمة كما يمكنك أيضا إضافة قسم من هنا     </p>

                    </div>

                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/images/Frame2step22.webp"
                            alt="التصنيفات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    </div>

                    <div className="flex flex-col gap-3 order-3 md:col-span-2">
                        <img
                            src="/images/Frame3step22.webp"
                            alt="التصنيفات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#5B7C93] font-medium text-center"> تخصصات العمل التي يمكن صاحب الخدمة القيام بها </p>

                    </div>

                    <div className="flex flex-col gap-3 order-3 md:col-span-2">
                        <img
                            src="/images/Frame4step22.webp"
                            alt="التصنيفات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
