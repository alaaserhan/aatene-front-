'use client';

export default function StepThree() {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2D496A] text-white font-bold text-base md:text-lg lg:text-xl leading-[1] pt-0.5">
                    2
                </div>
                <div>
                    <h2 className="text-[#2D496A] font-bold text-base md:text-lg lg:text-xl">
                        المعلومات المتقدمة
                    </h2>
                    <p className="text-[#2D496A] text-xs md:text-sm lg:text-base mt-1">
                        إضافة البيانات المطلوبة والتأكد من صحتها
                    </p>
                </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-[1336px] min-h-[750px] mx-auto overflow-visible">
                <img
                    src="/guide-images/Frame1step3.webp"
                    alt="معلومات متقدمة"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />

                <img
                    src="/guide-images/Arrow1stepthree.svg"
                    loading="lazy"
                    alt="arrow"
                    className="absolute w-[32.1%] h-auto top-[22%] left-[40%]"
                />

                <img
                    src="/guide-images/Arrow1stepthree.png"
                    loading="lazy"
                    alt=""
                    className="absolute w-[5.2%] top-[20%] left-[89%]"
                />

                <img
                    src="/guide-images/Arrow2step3.svg"
                    loading="lazy"
                    alt=""
                    className="absolute w-[6.5%] top-[76%] left-[88.9%] z-[10]"
                />

                <img
                    src="/guide-images/Arrow2stepthree.png"
                    loading="lazy"
                    alt=""
                    className="absolute w-[5.1%] top-[26.7%] left-[58%]"
                />

                <img
                    src="/guide-images/Arrow4step3.svg"
                    loading="lazy"
                    alt=""
                    className="absolute w-[48.5%] h-[30.4%] top-[54.5%] left-[36.5%] z-10"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[25%] left-[43.5%] max-w-[180px]">
                    ميزه معاينة المنتج ومشاهدة طريقة عرضه في المتجر
                </p>

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[19%] left-[94%] max-w-[160px]">
                    يمكنك اختيار القسم الذي ينتمي له المنتج   
                </p>

                <img
                    src="/guide-images/Frame2step1.webp"
                    alt="معلومات متقدمة"
                    className="absolute w-[36.4%] h-auto top-[5%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />
                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[50%] left-[11%] max-w-[400px]">
                    
                     هنا جميع الأقسام المضافة وعدد المنتجات داخل كل قسم    
                </p>

                <img
                    src="/guide-images/Frame3step3.webp"
                    alt="معلومات متقدمة"
                    className="absolute w-[36.4%] h-auto top-[56.4%] left-[5.6%] drop-shadow-xl"
                    loading="lazy"
                />

                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[99%] left-[10%] max-w-[400px]">
                    
                    بعد كتابة الكلمة المفتاحية هنا في البحث سوف يظهر منتجك بسهولة  
                </p>

                <img
                    src="/guide-images/Frame1step3.webp"
                    alt="معلومات متقدمة"
                    className="absolute w-[36.4%] h-auto top-[56.4%] left-[57.3%] drop-shadow-xl"
                    loading="lazy"
                />
                <p className="absolute text-[#2D496A] text-xs md:text-sm font-medium top-[84%] left-[92%] max-w-[180px]">
                    كلمات مفتاحية ستساعدك في الظهور عند كتابتها في البحث
                </p>

            </div>

            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="flex flex-col gap-3 order-1">
                        <img
                            src="/guide-images/Frame1step3.webp"
                            alt="معلومات متقدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                    <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> يمكنك اختيار القسم الذي ينتمي له المنتج<br/> وعلى اليسار تجد ميزه  معاينة المنتج ومشاهدة طريقة عرضه في المتجر<br/> </p>
 
                    </div>

                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/guide-images/Frame2step1.webp"
                            alt="معلومات متقدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> هنا جميع الأقسام المضافة وعدد المنتجات داخل كل قسم </p>
 
                    </div>

                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/guide-images/Frame1step3.webp"
                            alt="معلومات متقدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> كلمات مفتاحية تساعدك في الظهور عند كتابتها في البحث </p>
 
                    </div>


                    <div className="flex flex-col gap-3 order-2">
                        <img
                            src="/guide-images/Frame3step3.webp"
                            alt="معلومات متقدمة"
                            className="w-full h-auto drop-shadow-xl rounded-lg"
                            loading="lazy"
                        />
                        <p className="text-xs md:text-sm text-[#2D496A] font-medium text-center"> بعد كتابة الكلمة المفتاحية هنا في البحث سوف يظهر منتجك بسهولة  </p>
 
                    </div>
                </div>
            </div>
        </div>
    );
}
