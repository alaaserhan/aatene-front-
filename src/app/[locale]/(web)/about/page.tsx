"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/src/hooks/use-language";
import {
    Database,
    ShoppingCart,
    FileText,
    Monitor,
    Headphones,
    Users,
    BadgeCheck,
    LayoutGrid,
    Phone,
    Coins,
    HandHelping,
    Recycle,
    Package,
    Briefcase,
    Facebook,
    Instagram,
    ArrowLeft,
} from "lucide-react";

const WHY_US_FEATURES = [
    {
        icon: Database,
        title: "بدون عمولة على المبيعات",
        description: "احتفظ بكامل أرباحك دون اقتطاعات، وركز على تنمية عملك وزيادة دخلك.",
    },
    {
        icon: ShoppingCart,
        title: "خدمات ومنتجات متنوعة بمكان واحد",
        description: "وفر وقتك وجهدك، وابحث عن كل ما تحتاجه بسهولة في منصة واحدة.",
    },
    {
        icon: FileText,
        title: "كتابة محتوى متخصص في الخدمات والمنتجات",
        description: "محتوى SEO احترافي يرفع ترتيبك في جوجل ويحوّل البحث لمبيعات.",
    },
    {
        icon: Monitor,
        title: "سهولة استخدام من جميع الأجهزة",
        description: "تصفح وبيع واشتري بسهولة من الهاتف أو الكمبيوتر، أينما كنت وفي أي وقت.",
    },
    {
        icon: Headphones,
        title: "دعم مستمر وتدريب للتجار",
        description: "نقدم إرشادًا ومتابعة دورية لتطوير مهاراتك وتحقيق أفضل النتائج في تجارتك.",
    },
    {
        icon: Users,
        title: "مجتمع محلي حقيقي",
        description: "احتفظ بكامل أرباحك دون اقتطاعات، وركز على تنمية عملك وزيادة دخلك.",
    },
];

const SELL_CATEGORIES = [
    {
        icon: Briefcase,
        title: "الخدمات",
        description: "خدمة الحلاقة في البيت، تصوير مناسباتك، صيانة أجهزة المنزل، تصميم جرافيك لمشروعك، أو حتى تنظيف المنازل والمكاتب.",
    },
    {
        icon: Package,
        title: "المنتجات",
        description: "بيع المخبوزات الطازجة، الملابس العصرية، الإكسسوارات اليدوية، المنتجات الغذائية المحلية، أو التحف والهدايا.",
    },
    {
        icon: Recycle,
        title: "المنتجات المستعملة",
        description: "إعادة بيع الأجهزة الكهربائية بحالة ممتازة، الأثاث المستعمل، الأدوات المنزلية الزائدة، أو الملابس التي لم تعد تستخدمها.",
    },
];

const BUYER_FEATURES = [
    {
        icon: BadgeCheck,
        title: "منتجات محلية وخدمات موثوقة",
        description: "اكتشف أفضل المنتجات والخدمات من مزوّدين موثوقين في منطقتك.",
    },
    {
        icon: LayoutGrid,
        title: "كل شيء بمكان واحد",
        description: "وفّر وقتك وجهدك بالوصول لكل ما تحتاجه من مكان واحد.",
    },
    {
        icon: Phone,
        title: "تواصل مباشر وسريع",
        description: "تحدث مع المزوّدين مباشرة واحصل على ردود فورية.",
    },
    {
        icon: Coins,
        title: "أسعار تناسب الكل",
        description: "استمتع بخيارات متنوعة بأسعار تناسب مختلف الميزانيات.",
    },
    {
        icon: HandHelping,
        title: "دعم المشاريع الصغيرة بمجتمعك",
        description: "ساهم في نمو المشاريع المحلية وكن جزءًا من دعم مجتمعك.",
    },
];

const VISION_CARDS = [
    {
        title: "رؤيتنا",
        description: "أن نكون المنصة الرائدة في ربط الناس بخدمات ومنتجات محلية تعزز الاقتصاد المجتمعي في كل حي ومدينة.",
    },
    {
        title: "رسالتنا",
        description: "توفير مساحة رقمية لكل مزوّد خدمة أو منتج محلي لعرض أعماله، ومنح المستخدم طريقة ذكية وسريعة للحصول على احتياجاته.",
    },
    {
        title: "أهدافنا",
        description: "تمكين المشاريع الصغيرة، تسهيل عملية البيع، وخلق فرص دخل إضافية لأصحاب المهارات والمشاريع الفردية.",
    },
];

export default function AboutPage() {
    const lang = useLanguage();

    return (
        <div className="min-h-screen bg-white-1">
            {/* 1. Hero Banner */}
            <div className="bg-blue-3 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-1 text-right">
                            <p className="text-base md:text-lg text-white/90 leading-relaxed">
                                &quot;أعطيني&quot; هي منصة إلكترونية وسّيطة، تربط بين مزوّدي الخدمات وبائعي
                                المنتجات المحليين مع الزبائن، عبر واجهة بسيطة وسريعة، نمنح كل شخص
                                عنده خدمة أو منتج فرصة للظهور الرقمي، والوصول لجمهور مهتم بدون
                                عمولات أو تعقيدات.
                            </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-center gap-3">
                            <Image
                                src="/LOGO-H-WHITE.svg"
                                alt="Aatene Logo"
                                width={150}
                                height={150}
                                className="w-28 md:w-36"
                            />
                            <Image
                                src="/TYPO-WHITE.png"
                                alt="Aatene"
                                width={216}
                                height={93}
                                className="w-36 md:w-48"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. من نحن (Who We Are) */}
            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-right mb-8">من نحن؟</h2>
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                        <div className="md:w-2/5 shrink-0">
                            <div className="relative">
                                <div className="bg-blue-5 rounded-lg w-full aspect-[4/3] absolute top-4 start-4" />
                                <Image
                                    src="/Frame 1000005424.png"
                                    alt="Nazareth city"
                                    width={500}
                                    height={380}
                                    className="relative rounded-lg w-full aspect-[4/3] object-cover shadow-md"
                                />
                            </div>
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-sm text-gray-2 leading-loose mb-4">
                                في قلب الناصرة، بين شوارعها القديمة وأحلام شبابها وبناتها، انطلقت فكرة أعطيني.
                                نحن مجموعة شباب وصبايا من الناصرة، كبرنا وسط تحديات السوق المحلي، وشفنا كيف التجار
                                الصغار ومزوّدي الخدمات عم بواجهوا صعوبة يوصلوا لزبائنهم… وشفنا كمان الزبون، اللي دايمًا
                                بيدوّر على خدمة موثوقة أو منتج مضمون، ومش دايمًا بلاقيهم بسهولة.
                            </p>
                            <p className="text-sm text-gray-2 leading-loose mb-4">
                                من هون، انطلقت الفكرة: ليش ما يكون في منصة وحدة بتجمع الكل؟ مكان رقمي بيقرب التاجر من
                                الزبون، وبيسهل على الناس كل شي… بخطوة وحدة.
                            </p>
                            <p className="text-sm text-gray-2 leading-loose mb-6">
                                اشتغلنا سنة كاملة، ليل ونهار، جمعنا الخبرة، وبنينا منصة أعطيني من الصفر. اشتغلنا على كل
                                تفصيلة من تصميم سهل وبسيط، لخدمة عملاء واضحة، لضمان الشفافية والثقة.
                            </p>
                            <p className="text-blue-4 font-medium mb-4 underline cursor-pointer">
                                حقل الملف لمعرفة المزيد عن منصة أعطيني
                            </p>
                            <button className="border border-blue-4 text-blue-4 px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-5 transition-colors">
                                تحميل الملف لمعرفة المزيد
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. رؤيتنا ورسالتنا (Vision / Mission / Goals) */}
            <div className="bg-white-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">
                            رؤيتنا ورسالتنا نحو دعم المشاريع المحلية
                        </h2>
                        <p className="text-sm text-gray-2 max-w-3xl mx-auto">
                            نعمل على تمكين المشاريع الصغيرة من التوسع والظهور الرقمي، ونمنح كل مستخدم مساحة ذكية وسهلة للوصول إلى الخدمات والمنتجات المحلية بسرعة وثقة.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {VISION_CARDS.map((card, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 md:p-8 text-right">
                                <div className="flex items-center gap-2 mb-4 justify-end">
                                    <h3 className="text-xl font-bold">{card.title}</h3>
                                    <div className="w-3 h-3 rounded-full bg-blue-4" />
                                </div>
                                <p className="text-sm text-gray-2 leading-relaxed">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. لماذا نحن (Why Us) */}
            <div className="bg-gray-4/30 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-10 md:gap-16">
                        <div className="flex-1 space-y-6">
                            {WHY_US_FEATURES.map((feature, index) => {
                                const IconComponent = feature.icon;
                                return (
                                    <div key={index} className="flex items-start gap-4 text-right flex-row-reverse">
                                        <div className="bg-blue-4 rounded-lg p-2.5 shrink-0">
                                            <IconComponent className="w-5 h-5 text-white" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold mb-1">{feature.title}</h4>
                                            <p className="text-sm text-gray-2 leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="md:w-2/5 shrink-0 text-right flex flex-col justify-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 justify-end">
                                لماذا نحن؟
                                <span className="w-2 h-2 rounded-full bg-blue-4" />
                            </h2>
                            <p className="text-sm text-gray-2 leading-relaxed">
                                في &quot;أعطيني&quot;، نؤمن بأن البيع والشراء يجب أن يكون سهلاً، سريعاً،
                                وخالياً من التعقيدات. لذلك نوفر لك منصة موثوقة تربطك مباشرةً بأهل منطقتك،
                                بدون عمولات، مع دعم مستمر وتنوع كبير في الخدمات والمنتجات.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Seller CTA Section */}
            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="text-right mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">
                            عندك خدمة أو منتج؟ خلّي الناس القريبين يشتروا منك بسهولة!
                        </h2>
                        <p className="text-sm text-gray-2 leading-relaxed mb-6">
                            منصة مخصصة لأصحاب المشاريع الصغيرة، الحرفيين، وبائعي المنتجات والخدمات. نوصلك مباشرةً بعملاء منطقتك بطريقة سهلة وسريعة، مع دعم مستمر وأدوات تساعدك على عرض منتجاتك وزيادة مبيعاتك.
                        </p>
                        <Link
                            href={`/${lang}/signup`}
                            className="bg-blue-4 text-white px-8 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity inline-block"
                        >
                            انضم اليوم، وخلّي الناس تشتري منك بسهولة
                        </Link>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-right mb-6">شو بتقدر تبيع؟</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {SELL_CATEGORIES.map((category, index) => {
                            const IconComponent = category.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl p-6 text-center flex flex-col items-center">
                                    <div className="bg-blue-5 rounded-2xl p-4 mb-4">
                                        <IconComponent className="w-7 h-7 text-blue-4" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-lg font-bold mb-3">{category.title}</h4>
                                    <p className="text-sm text-gray-2 leading-relaxed">{category.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 6. Buyer Section */}
            <div className="py-12 md:py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-right mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">بدك تشتري من أهل بلدك؟</h2>
                        <p className="text-sm text-gray-2 leading-relaxed mb-6">
                            في &quot;أعطيني&quot; تلاقي كل احتياجاتك في مكان واحد، من منتجات وخدمات محلية موثوقة. تقدر تتواصل مباشرة مع البائع، تطلب بسهولة، وتستلم بسرعة وبأسعار تناسب ميزانيتك.
                        </p>
                        <div className="flex gap-4 justify-end flex-wrap">
                            <Link
                                href={`/${lang}/search`}
                                className="border border-blue-4 text-blue-4 px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-5 transition-colors"
                            >
                                ابحث عن خدمة أو منتج محدّد
                            </Link>
                            <Link
                                href={`/${lang}/search?type=products`}
                                className="bg-blue-4 text-white px-6 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                تصفح العروض الآن
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 divide-y divide-gray-4">
                        {BUYER_FEATURES.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="flex items-center gap-4 py-8 flex-row-reverse">
                                    <div className="bg-blue-4 rounded-xl p-3.5 shrink-0">
                                        <IconComponent className="w-6 h-6 text-white" strokeWidth={1.5} />
                                    </div>
                                    <div className="text-right flex-1">
                                        <h4 className="text-base font-bold mb-1">{feature.title}</h4>
                                        <p className="text-sm text-gray-2">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 7. Contact Form Section */}
            <div className="py-12 md:py-16 bg-white-1">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 text-right mb-10">
                        <div className="flex-1">
                            <p className="text-blue-4 font-medium mb-2 text-lg">ابدأ الآن بإضافة رسالتك</p>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                تواصل معنا، نحن هنا لمساعدتك.
                            </h2>
                            <p className="text-sm text-gray-2 leading-relaxed">
                                فريقنا جاهز يرد على كل استفساراتك ويساعدك بخطوات واضحة وسريعة، سواء كنت حابب تعرف أكثر عن خدماتنا أو تحتاج دعم في طلبك. لا تتردد، رسالتك تهمنا.
                            </p>
                        </div>
                        <div className="flex md:flex-col gap-3 items-center shrink-0">
                            <a href="#" className="border border-gray-4 rounded-full p-3 hover:bg-blue-5 transition-colors">
                                <Facebook className="w-5 h-5 text-blue-4" />
                            </a>
                            <a href="#" className="border border-gray-4 rounded-full p-3 hover:bg-blue-5 transition-colors">
                                <Instagram className="w-5 h-5 text-blue-4" />
                            </a>
                            <a href="#" className="border border-gray-4 rounded-full p-3 hover:bg-blue-5 transition-colors">
                                <svg className="w-5 h-5 text-blue-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm">
                        <div className="flex items-center gap-3 justify-center mb-8">
                            <h3 className="text-lg font-medium">نحن هنا للاستماع، اكتب ما ترغب بمشاركته معنا</h3>
                            <span className="text-2xl">🤗</span>
                        </div>

                        <form className="space-y-6 max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="الاسم"
                                        className="w-full border-b border-gray-4 py-3 text-right bg-transparent outline-none focus:border-blue-4 transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="البريد الالكتروني"
                                        className="w-full border-b border-gray-4 py-3 text-right bg-transparent outline-none focus:border-blue-4 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <textarea
                                    placeholder="الرسالة"
                                    rows={5}
                                    className="w-full border-b border-gray-4 py-3 text-right bg-transparent outline-none focus:border-blue-4 transition-colors resize-none text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-3 text-white py-4 rounded-lg text-base font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                أرسل الرسالة
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
