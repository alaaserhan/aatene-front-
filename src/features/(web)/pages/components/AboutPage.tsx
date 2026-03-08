"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useGetAboutUs } from "@/src/features/(web)/pages/hooks";
import { useSendContact } from "@/src/features/(web)/pages/hooks";

// ─── Fallback static data (used when API returns nothing) ──────────────────

const FALLBACK_WHY_US = [
    { icon: "/about/1.svg", title: "بدون عمولة على المبيعات", description: "احتفظ بكامل أرباحك دون اقتطاعات، وركز على تنمية عملك وزيادة دخلك." },
    { icon: "/about/2.svg", title: "خدمات ومنتجات متنوعة بمكان واحد", description: "وفر وقتك وجهدك، وابحث عن كل ما تحتاجه بسهولة في منصة واحدة." },
    { icon: "/about/3.svg", title: "كتابة محتوى متخصص في الخدمات والمنتجات", description: "محتوى SEO احترافي يرفع ترتيبك في جوجل ويحوّل البحث لمبيعات." },
    { icon: "/about/4.svg", title: "سهولة استخدام من جميع الأجهزة", description: "تصفح وبيع واشتري بسهولة من الهاتف أو الكمبيوتر، أينما كنت وفي أي وقت." },
    { icon: "/about/5.svg", title: "دعم مستمر وتدريب للتجار", description: "نقدم إرشادًا ومتابعة دورية لتطوير مهاراتك وتحقيق أفضل النتائج في تجارتك." },
    { icon: "/about/6.svg", title: "مجتمع محلي حقيقي", description: "احتفظ بكامل أرباحك دون اقتطاعات، وركز على تنمية عملك وزيادة دخلك." },
];

const FALLBACK_MERCHANTS_SECTIONS = [
    { icon: "/about/7.svg", title: "الخدمات", description: "خدمة الحلاقة في البيت، تصوير مناسباتك، صيانة أجهزة المنزل، تصميم جرافيك لمشروعك، أو حتى تنظيف المنازل والمكاتب." },
    { icon: "/about/8.svg", title: "المنتجات", description: "بيع المخبوزات الطازجة، الملابس العصرية، الإكسسوارات اليدوية، المنتجات الغذائية المحلية، أو التحف والهدايا." },
    { icon: "/about/9.svg", title: "المنتجات المستعملة", description: "إعادة بيع الأجهزة الكهربائية بحالة ممتازة، الأثاث المستعمل، الأدوات المنزلية الزائدة، أو الملابس التي لم تعد تستخدمها." },
];

const FALLBACK_CUSTOMERS_SECTIONS = [
    { icon: "/about/10.svg", title: "منتجات محلية وخدمات موثوقة", description: "اكتشف أفضل المنتجات والخدمات من مزوّدين موثوقين في منطقتك." },
    { icon: "/about/11.svg", title: "كل شيء بمكان واحد", description: "وفّر وقتك وجهدك بالوصول لكل ما تحتاجه من مكان واحد." },
    { icon: "/about/12.svg", title: "تواصل مباشر وسريع", description: "تحدث مع المزوّدين مباشرة واحصل على ردود فورية." },
    { icon: "/about/13.svg", title: "أسعار تناسب الكل", description: "استمتع بخيارات متنوعة بأسعار تناسب مختلف الميزانيات." },
    { icon: "/about/14.svg", title: "دعم المشاريع الصغيرة بمجتمعك", description: "ساهم في نمو المشاريع المحلية وكن جزءًا من دعم مجتمعك." },
];

const FALLBACK_VISION_CARDS = [
    { title: "رؤيتنا", description: "أن نكون المنصة الرائدة في ربط الناس بخدمات ومنتجات محلية تعزز الاقتصاد المجتمعي في كل حي ومدينة." },
    { title: "رسالتنا", description: "توفير مساحة رقمية لكل مزوّد خدمة أو منتج محلي لعرض أعماله، ومنح المستخدم طريقة ذكية وسريعة للحصول على احتياجاته." },
    { title: "أهدافنا", description: "تمكين المشاريع الصغيرة، تسهيل عملية البيع، وخلق فرص دخل إضافية لأصحاب المهارات والمشاريع الفردية." },
];

export default function AboutPage() {
    const { data: response, isLoading, isError } = useGetAboutUs();
    const { mutate: sendContactMsg, isPending: isSending } = useSendContact();
    const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) return;
        sendContactMsg(contactForm, {
            onSuccess: () => {
                setContactForm({ name: "", email: "", message: "" });
                alert("✅ تم إرسال رسالتك بنجاح، سنتواصل معك قريباً.");
            },
            onError: () => {
                alert("❌ حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.");
            },
        });
    };

    const aboutUs = response?.aboutUs;

    // ─── Intro content ──────────────────────────────────────────────
    const introContent = aboutUs?.sectionIntroContent ?? null;

    // ─── About us section ───────────────────────────────────────────
    const aboutUsContent = aboutUs?.sectionAboutUs?.content ?? null;
    const aboutUsImageUrl = aboutUs?.sectionAboutUs?.image_url ?? null;

    // ─── Vision cards ───────────────────────────────────────────────
    const vision = aboutUs?.sectionVision;
    const visionCards = vision
        ? [
              { title: "رؤيتنا",   description: vision.vision  ?? "" },
              { title: "رسالتنا",  description: vision.message ?? "" },
              { title: "أهدافنا",  description: vision.goals   ?? "" },
          ]
        : FALLBACK_VISION_CARDS;

    // ─── Why us ─────────────────────────────────────────────────────
    // نستخدم الـ fallback دائماً كـ base، ونُدمج بيانات الـ API فوقها إن وُجدت
    const apiWhyUs = aboutUs?.sectionWhyUs ?? [];
    const whyUsItems = FALLBACK_WHY_US.map((fallback, i) => {
        const apiItem = apiWhyUs[i];
        if (!apiItem) return fallback;
        return {
            icon: apiItem.image_url && apiItem.image_url.trim() !== ""
                ? apiItem.image_url
                : fallback.icon,
            title: apiItem.title && apiItem.title.trim() !== "" ? apiItem.title : fallback.title,
            description: apiItem.content && apiItem.content.trim() !== "" ? apiItem.content : fallback.description,
        };
    });

    // ─── Merchants ──────────────────────────────────────────────────
    const merchantsTitle   = aboutUs?.sectionMerchants?.title?.trim()   || "عندك خدمة أو منتج؟ خلّي الناس القريبين يشتروا منك بسهولة!";
    const merchantsContent = aboutUs?.sectionMerchants?.content?.trim() || "منصة مخصصة لأصحاب المشاريع الصغيرة، الحرفيين، وبائعي المنتجات والخدمات. نوصلك مباشرةً بعملاء منطقتك بطريقة سهلة وسريعة، مع دعم مستمر وأدوات تساعدك على عرض منتجاتك وزيادة مبيعاتك.";
    const apiMerchantsSections = aboutUs?.sectionMerchants?.sections ?? [];
    const merchantsSections = FALLBACK_MERCHANTS_SECTIONS.map((fallback, i) => {
        const apiItem = apiMerchantsSections[i];
        if (!apiItem) return fallback;
        return {
            icon: apiItem.image_url && apiItem.image_url.trim() !== "" ? apiItem.image_url : fallback.icon,
            title: apiItem.title?.trim() || fallback.title,
            description: apiItem.content?.trim() || fallback.description,
        };
    });

    // ─── Customers ──────────────────────────────────────────────────
    const customersTitle   = aboutUs?.sectionCustomers?.title?.trim()   || "بدك تشتري من أهل بلدك؟";
    const customersContent = aboutUs?.sectionCustomers?.content?.trim() || "في \"أعطيني\" تلاقي كل احتياجاتك في مكان واحد، من منتجات وخدمات محلية موثوقة. تقدر تتواصل مباشرة مع البائع، تطلب بسهولة، وتستلم بسرعة وبأسعار تناسب ميزانيتك.";
    const apiCustomersSections = aboutUs?.sectionCustomers?.sections ?? [];
    const customersSections = FALLBACK_CUSTOMERS_SECTIONS.map((fallback, i) => {
        const apiItem = apiCustomersSections[i];
        if (!apiItem) return fallback;
        return {
            icon: apiItem.image_url && apiItem.image_url.trim() !== "" ? apiItem.image_url : fallback.icon,
            title: apiItem.title?.trim() || fallback.title,
            description: apiItem.content?.trim() || fallback.description,
        };
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-white-1 flex items-center justify-center text-red-500">
                حدث خطأ أثناء تحميل البيانات.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white-1">
            <div className="bg-blue-3 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col-reverse md:flex-row items-center gap-[30px]">
                        <div className="shrink-0 flex flex-col items-center">
                            <Image
                                src="/LOGO-H-WHITE-2.svg"
                                alt="Aatene Logo"
                                width={216}
                                height={274}
                                unoptimized
                                className="w-[140px] md:w-[216px]"
                                style={{ height: "auto" }}
                            />
                        </div>
                        <div className="flex-1 text-right">
                            <p
                                className="text-white"
                                style={{
                                    fontFamily: "var(--font-ping-ar), sans-serif",
                                    fontWeight: 700,
                                    fontSize: "30px",
                                    lineHeight: "126%",
                                    letterSpacing: "-0.03em",
                                    textAlign: "right",
                                }}
                            >
                                {introContent ?? (
                                    <>
                                        &quot;أعطيني&quot; هي منصة إلكترونية وسّيطة، تربط بين مزوّدي الخدمات وبائعي<br />
                                        المنتجات المحليين مع الزبائن، عبر واجهة بسيطة وسريعة، نمنح كل شخص<br />
                                        عنده خدمة أو منتج فرصة للظهور الرقمي، والوصول لجمهور مهتم بدون<br />
                                        عمولات أو تعقيدات.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white py-12 md:py-16 w-full flex justify-center">
                <div className="container px-4 flex justify-center">
                    <div
                        className="flex flex-col md:flex-row items-center justify-between mx-auto w-full"
                        style={{
                            maxWidth: "1356.38px",
                            minHeight: "467px",
                            gap: "20px",
                            opacity: 1
                        }}
                    >
                        {/* Right side: text */}
                        <div className="flex-1 text-right flex flex-col justify-center">
                            <h2 className="text-3xl md:text-[38px] font-bold mb-6 text-black">من نحن؟</h2>
                            {aboutUsContent ? (
                                <p className="text-base md:text-[20px] text-gray-2 leading-[1.8] mb-8 font-medium whitespace-pre-line">
                                    {aboutUsContent}
                                </p>
                            ) : (
                                <>
                                    <p className="text-base md:text-[20px] text-gray-2 leading-[1.8] mb-4 font-medium">
                                        في قلب الناصرة، بين شوارعها القديمة وأحلام شبابها وبناتها، انطلقت فكرة أعطيني.
                                        نحن مجموعة شباب وصبايا من الناصرة، كبرنا وسط تحديات السوق المحلي، وشفنا كيف التجار
                                        الصغار ومزوّدي الخدمات عم بواجهوا صعوبة يوصلوا لزبائنهم... وشفنا كمان الزبون، اللي
                                        دائمًا بيدوّر على خدمة موثوقة أو منتج مضمون، ومش دائمًا بلاقيهم بسهولة.
                                    </p>
                                    <p className="text-base md:text-[20px] text-gray-2 leading-[1.8] mb-4 font-medium">
                                        من هون، انطلقت الفكرة: ليش ما يكون في منصة وحدة بتجمع الكل؟ مكان رقمي بيقرب التاجر من
                                        الزبون، وبيسهل على الناس كل شي... بخطوة وحدة.
                                    </p>
                                    <p className="text-base md:text-[20px] text-gray-2 leading-[1.8] mb-8 font-medium">
                                        اشتغلنا سنة كاملة، ليل ونهار، جمعنا الخبرة، وبنينا منصة أعطيني من الصفر. اشتغلنا على كل
                                        تفصيلة من تصميم سهل وبسيط، لخدمة عملاء واضحة، لضمان الشفافية والثقة.
                                    </p>
                                </>
                            )}
                        </div>
                        {/* Left side: Grouped image */}
                        <div className="w-full md:w-[45%] shrink-0 flex justify-center md:justify-end">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/about/Group 4.png"
                                alt="Nazareth city"
                                className="w-full max-w-[461px] h-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white-1 py-12 md:py-16">
                <div className="container mx-auto px-4 flex flex-col items-center">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-[32px] font-bold mb-4">
                            رؤيتنا ورسالتنا نحو دعم المشاريع المحلية
                        </h2>
                        <p className="text-base md:text-[20px] text-gray-2 max-w-4xl mx-auto leading-relaxed">
                            نعمل على تمكين المشاريع الصغيرة من التوسع والظهور الرقمي، ونمنح كل مستخدم مساحة ذكية وسهلة للوصول إلى الخدمات والمنتجات المحلية بسرعة وثقة.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row flex-wrap justify-center gap-[30px] w-full">
                        {visionCards.map((card, index) => (
                            <div
                                key={index}
                                className="bg-white flex flex-col items-end justify-start text-right flex-1"
                                style={{
                                    minWidth: "280px",
                                    maxWidth: "410.67px",
                                    borderRadius: "20px",
                                    padding: "32px",
                                }}
                            >
                                <div className="flex items-center gap-2 mb-6 justify-start w-full">
                                    <div className="w-3 h-3 rounded-full bg-blue-4 shrink-0" />
                                    <h3 className="text-[24px] font-bold">{card.title}</h3>
                                </div>
                                <p className="text-base md:text-[18px] text-gray-2 leading-[1.8] w-full">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white py-12 md:py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] pointer-events-none z-0 hidden md:block">
                    <Image
                        src="/about/Vector.svg"
                        alt="Background Shape"
                        fill
                        unoptimized
                        className="object-contain object-right-top"
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10 w-full flex justify-center">
                    <div className="flex flex-col md:flex-row gap-10 md:gap-24 items-center justify-between mx-auto w-full max-w-[1200px]">
                        <div className="md:w-[45%] shrink-0 text-right flex flex-col justify-center">
                            <h2 className="text-[32px] md:text-[40px] font-bold mb-6 flex items-center gap-3 justify-start text-black">
                                <span className="w-3 h-3 rounded-full bg-black mb-1" />
                                لماذا نحن؟
                            </h2>
                            <p className="text-[16px] md:text-[18px] text-gray-2 font-medium leading-[2]">
                                في &quot;أعطيني&quot;، نؤمن بأن البيع والشراء يجب أن يكون سهلاً، سريعاً،
                                وخالياً من التعقيدات. لذلك نوفر لك منصة موثوقة تربطك مباشرةً بأهل منطقتك،
                                بدون عمولات، مع دعم مستمر وتنوع كبير في الخدمات والمنتجات.
                            </p>
                        </div>
                        <div className="flex-1 space-y-8 md:space-y-10">
                            {whyUsItems.map((feature, index) => {
                                return (
                                    <div key={index} className="flex items-start gap-4 text-right flex-row">
                                        <div className="shrink-0 flex items-center justify-center pt-1 md:pt-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={feature.icon} alt={feature.title} width={40} height={40} className="object-contain" />
                                        </div>
                                        <div>
                                            <h4 className="text-[18px] md:text-[20px] font-bold mb-2 text-black">{feature.title}</h4>
                                            <p className="text-[14px] md:text-[16px] text-gray-2 leading-[1.8] font-medium">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="text-right mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">
                            {merchantsTitle}
                        </h2>
                        <p className="text-sm text-gray-2 leading-relaxed mb-6">
                            {merchantsContent}
                        </p>
                        <Link
                            href={`/signup`}
                            className="bg-blue-4 text-white px-8 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity inline-block"
                        >
                            انضم اليوم، وخلّي الناس تشتري منك بسهولة
                        </Link>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-right mb-6">شو بتقدر تبيع؟</h3>
                    <div className="flex flex-col md:flex-row flex-wrap justify-center gap-[30px] w-full">
                        {merchantsSections.map((category, index) => {
                            return (
                                <div
                                    key={index}
                                    className="bg-white flex flex-col items-center justify-center text-center"
                                    style={{
                                        width: "411px",
                                        height: "283px",
                                        borderRadius: "20px",
                                        padding: "32px",
                                        gap: "24px" // Slightly less than 30px to account for overall fit, but maintaining separation
                                    }}
                                >
                                    <Image src={category.icon} alt={category.title} width={48} height={48} className="object-contain" unoptimized />
                                    <div>
                                        <h4 className="text-[20px] font-bold mb-3">{category.title}</h4>
                                        <p className="text-[16px] text-gray-2 leading-[1.8] font-medium">{category.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="py-12 md:py-16 bg-white-1">
                <div className="container mx-auto px-4">
                    <div className="text-right mb-10 flex flex-col items-start w-full" style={{ maxWidth: "1365px", margin: "0 auto 40px" }}>
                        <h2 className="text-[32px] md:text-[40px] font-bold mb-4 text-black w-full text-right">{customersTitle}</h2>
                        <p className="text-[16px] md:text-[18px] text-gray-2 leading-[1.8] mb-8 font-medium max-w-[800px] text-right">
                            {customersContent}
                        </p>
                        <div className="flex gap-4 justify-start flex-wrap w-full">
                            <Link
                                href={`/search?type=products`}
                                className="bg-white text-black min-w-[180px] text-center px-8 py-3 rounded-[10px] text-[16px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                تصفح العروض الآن
                            </Link>
                            <Link
                                href={`/search`}
                                className="bg-white text-black min-w-[180px] text-center px-8 py-3 rounded-[10px] text-[16px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                ابحث عن خدمة أو منتج محدّد
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col items-center w-full" style={{ gap: "30px" }}>
                        {customersSections.map((feature, index) => {
                            return (
                                <div
                                    key={index}
                                    className="bg-white flex flex-row items-center justify-start text-right"
                                    style={{
                                        width: "100%",
                                        maxWidth: "1365px",
                                        height: "141px",
                                        borderRadius: "20px",
                                        padding: "10px 32px",
                                        gap: "24px"
                                    }}
                                >
                                    <div className="shrink-0 flex items-center justify-center">
                                        <Image src={feature.icon} alt={feature.title} width={45} height={45} className="object-contain" unoptimized />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="text-[18px] md:text-[22px] font-bold mb-2 text-black">{feature.title}</h4>
                                        <p className="text-[14px] md:text-[16px] text-gray-2 font-medium">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="py-12 md:py-16 bg-white-1">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 text-right mb-10">
                        <div className="flex-1">
                            <p className="text-blue-4 font-medium mb-2 text-lg">ابدأ الآن بإضافة رسالتك</p>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                تواصل معنا، نحن هنا لمساعدتك.
                            </h2>
                            <p
                                className="text-gray-2"
                                style={{
                                    fontFamily: "var(--font-ping-ar), 'Ping AR + LT', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "18px",
                                    lineHeight: "40px",
                                    textAlign: "right"
                                }}
                            >
                                فريقنا جاهز يرد على كل استفساراتك ويساعدك بخطوات واضحة وسريعة، سواء كنت حابب تعرف أكثر عن خدماتنا أو تحتاج دعم في طلبك. لا تتردد، رسالتك تهمنا.
                            </p>
                        </div>
                        <div className="flex md:flex-col gap-4 items-center shrink-0">
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Image
                                    src="/about/fb.svg"
                                    alt="Facebook"
                                    width={50}
                                    height={50}
                                    className="object-contain"
                                    style={{
                                        width: "49.98px",
                                        height: "49.7px",

                                    }}
                                />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Image
                                    src="/about/insta.svg"
                                    alt="Instagram"
                                    width={50}
                                    height={50}
                                    className="object-contain"
                                    style={{
                                        width: "49.98px",
                                        height: "49.7px",

                                    }}
                                />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Image
                                    src="/about/X.png"
                                    alt="X"
                                    width={50}
                                    height={50}
                                    className="object-contain"
                                    style={{
                                        width: "49.98px",
                                        height: "49.7px",

                                    }}
                                />
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm">
                        <div className="flex items-center gap-3 justify-center mb-8">
                            <h3 className="text-lg font-medium">نحن هنا للاستماع، اكتب ما ترغب بمشاركته معنا</h3>
                            <span className="text-2xl">🤗</span>
                        </div>

                        <form className="space-y-6 max-w-4xl mx-auto" onSubmit={handleContactSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="الاسم"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="w-full border-b border-gray-4 py-3 text-right bg-transparent outline-none focus:border-blue-4 transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="البريد الالكتروني"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="w-full border-b border-gray-4 py-3 text-right bg-transparent outline-none focus:border-blue-4 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <textarea
                                    placeholder="الرسالة"
                                    rows={5}
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                                    required
                                    className="w-full border-b border-gray-4 py-3 text-right bg-transparent outline-none focus:border-blue-4 transition-colors resize-none text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full bg-blue-3 text-white py-4 rounded-lg text-base font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        أرسل الرسالة
                                        <ArrowLeft className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
