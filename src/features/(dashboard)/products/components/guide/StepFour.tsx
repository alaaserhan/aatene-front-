'use client';

export default function StepFour() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl leading-[1] pt-0.5">
                    3
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl">الأختيارات و الكميات</h2>
                    <p className="text-[#2D496A] text-xs md:text-sm lg:text-base mt-1">إضافة البيانات المطلوبة والتأكد من صحتها</p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[800px] mx-auto ">
                <img
                    src="/images/Frame1step4.webp"
                    alt="الإختيارات والكميات - يمين"
                    className="absolute w-[36.4%] h-auto top-[3%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame2step4.webp"
                    alt="الإختيارات والكميات - يسار"
                    className="absolute w-[36.4%] h-auto top-[3%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/images/Frame3step4.webp"
                    alt="الإختيارات والكميات - وسط"
                    className="absolute w-[36.4%] h-auto top-[57.4%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"                
                />

                <img
                    src="/images/Frame4step4.webp"
                    alt="صفحة المنتج - تفاصيل المنتج"
                    className="absolute w-[36.4%] h-auto top-[57.4%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />


                <img
                    src="/Arrow1step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[45%] h-auto top-[21%] left-[39.5%] "
                />


                <img
                    src="/Arrow3step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[3.5%] h-auto top-[17.3%] left-[89%]"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[16.5%] left-[93%] max-w-[5.5%]">
                    يتم تحديد اذا كان هناك إختلاف ام لا
                </p>
                
                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[79%] left-[45%] whitespace-nowrap">
                    إضافة قيمة جديدة
                </p>

                <img
                    src="/Arrow4step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[17.9%] h-auto top-[80%] left-[53.5%]"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[83.2%] left-[43%] whitespace-nowrap">
                    زر تفعيل المنتج أو ايقافها مؤقتا
                </p>

                <img
                    src="/Arrow4step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[16.7%] h-auto top-[84.4%] left-[57%]"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[86.5%] left-[44%] whitespace-nowrap">
                    زر ازالة القيمة المضافة
                </p>

                <img
                    src="/Arrow4step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[17.3%] h-auto top-[87.5%] left-[54.5%]"
                />

                <img
                    src="/Arrow5step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[7%] h-auto top-[88.5%] left-[88.5%]"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[92%] left-[92%] max-w-[250px] ">
                    كما يمكنك أيضا إضافة خيار في <br/>حالة عدم وجود الاختيار الذي تريده
                </p>

                <img
                    src="/Arrow6step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[10%] h-auto top-[74.5%] left-[1.5%]"
                />
                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[97%] left-[8%] max-w-[380px]">
                هنا يوجد اختر المقاس واختر اللون بالقيم المضافة مثال (M ,XL )
وهذه هي الاختلافات من المنتج ونقصد بها السمات     
                </p>

                <img
                    src="/Arrow7step4.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[60%] h-auto top-[34%] left-[23.5%]"
                />
                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[52.5%] left-[51%] whitespace-nowrap">
                بعد اختيار السمات التي تريدها والضغط علي تأكيد سوف تنتقل هنا 
                </p>

            </div>

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/images/Frame1step4.webp"
                            alt="الإختيارات والكميات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> يتم تحديد اذا كان هناك إختلاف ام لا </p>
 
                    </div>

                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/images/Frame2step4.webp"
                            alt="الإختيارات والكميات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> بعد اختيار السمات التي تريدها والضغط علي تأكيد سوف تنتقل هنا </p>
                    </div>

                    <div className="flex flex-col gap-3 order-3 md:col-span-2">
                        <img
                            src="/images/Frame3step4.webp"
                            alt="الإختيارات والكميات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center">  يمكنك هنا إضافة قيمة جديدة <br/> أسفلها تجد زر تفعيل المنتج أو إيقافه مؤقتاً <br/> بجوار زر التفعيل تجد زر ازالة القيمة المضافة<br/>كما يمكنك أيضا على اليمين إضافة خيار في حالة عدم وجود الاختيار الذي تريده</p>
                    </div>

                    <div className="flex flex-col gap-3 order-3 md:col-span-2">
                        <img
                            src="/images/Frame4step4.webp"
                            alt="الإختيارات والكميات"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> هنا يوجد اختر المقاس واختر اللون بالقيم المضافة مثال (M ,XL )
وهذه هي الاختلافات من المنتج ونقصد بها السمات  </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
