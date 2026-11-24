import type { LucideIcon } from "lucide-react";
import { CalendarCheck2, FolderMinus, Link, PackagePlus, Palette, PencilLine, Sparkles, Zap } from "lucide-react";

/** Files live in `public/merchant-landing/`; a missing file renders a labelled placeholder. */
export type LandingAsset = {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** Widths of the narrower copies saved beside `src` as `<name>-<width>.<ext>`. */
    widths?: number[];
};

const asset = (file: string, alt: string, width: number, height: number, widths?: number[]): LandingAsset => ({
    src: `/merchant-landing/${file}`,
    alt,
    width,
    height,
    widths,
});

/**
 * Image optimization is off site-wide (`images.unoptimized`), so `next/image` never emits a
 * `srcset`; responsive copies are pre-generated and listed here instead.
 */
export const assetSrcSet = ({ src, width, widths = [] }: LandingAsset) => {
    const dot = src.lastIndexOf(".");
    return [...widths.map((w) => `${src.slice(0, dot)}-${w}${src.slice(dot)} ${w}w`), `${src} ${width}w`].join(", ");
};

export const HERO = {
    title: "افتح متجرك الإلكتروني مجانًا، وسهّل على زبائن جدد اكتشاف منتجاتك وخدماتك.",
    description:
        "مع أعطيني، صار عندك مكان واحد تعرض فيه منتجاتك أو خدماتك بالصور والأسعار والتفاصيل، وتسهل على الزبائن اكتشاف متجرك والتواصل معك.",
    cta: "أنشئ متجرك الآن",
    mockup: asset(
        "hero-mockup-cropped.webp",
        "صفحة متجر على أعطيني تظهر على الحاسوب والهاتف",
        1809,
        1800,
        [640, 960, 1280],
    ),
};

export const HEADER_CTA = "أنشئ متجرك مجانًا";

export const TRUST_POINTS = [
    "إنشاء مجاني 100%",
    "بدون رسوم تسجيل أو اشتراك",
    "بدون عمولة على المبيعات",
];

export type BenefitItem = {
    title: string;
    description: string;
    image: LandingAsset;
    soon?: boolean;
};

export const BENEFITS = {
    /** The title is split so the brand name can take the brand color. */
    title: { before: "شو رح تستفيد لما تفتح متجرك على ", brand: "أعطيني", after: "؟" },
    description:
        "مع أعطيني، بتزيد فرص ظهور منتجاتك وخدماتك للناس اللي بيدوروا على شغلات مثل اللي بتقدمها.",
    items: [
        {
            title: "زبائن جدد يكتشفوا شغلك",
            description:
                "مع أعطيني، بتزيد فرص ظهور منتجاتك وخدماتك للناس اللي بيدوروا على شغلات مثل اللي بتقدمها.",
            image: asset("benefit-new-customers.png", "", 57, 57),
        },
        {
            title: "كل منتجاتك وخدماتك بمكان واحد",
            description:
                "بدل ما تبعت الصور والأسعار لكل زبون لحاله، اعرض كل التفاصيل بمتجرك، وخلي الزبائن يشوفوا اللي بتقدمه بأي وقت.",
            image: asset("benefit-one-place.png", "", 61, 61),
        },
        {
            title: "تواصل أسهل مع الزبائن",
            description:
                "استقبل رسائل الزبائن وطلبات الأسعار في مكان واحد، وتابع استفساراتهم بسهولة.",
            image: asset("benefit-contact.png", "", 61, 61),
        },
        {
            title: "متجر مرتب يعكس شغلك",
            description:
                "خلي الزبائن يتعرفوا على مشروعك من خلال صور المنتجات، والمعلومات الواضحة، والتقييمات المتاحة، حتى يقدروا يختاروا اللي يناسبهم بثقة أكبر.",
            image: asset("benefit-organized.png", "", 61, 61),
        },
        {
            title: "استقبل حجوزات خدماتك بسهولة",
            description:
                "حدد مواعيد خدماتك، وخلي الزبائن يحجزوا مباشرة من متجرك، وتابع كل حجوزاتك بمكان واحد.",
            image: asset("benefit-bookings.png", "", 61, 61),
            soon: true,
        },
    ] satisfies BenefitItem[],
};

export const SHOWCASE = {
    title: "اعرض منتجاتك وخدماتك مجانًا.",
    items: [
        "أضف منتجاتك أو خدماتك بسهولة.",
        "عرض الصور والأسعار والتفاصيل.",
        "تنظيم المنتجات داخل التصنيفات.",
        "استقبال استفسارات الزبائن والتواصل معهم.",
    ],
    image: asset("showcase-screen.webp", "صفحة متجر على أعطيني", 609, 385),
};

export type ComingSoonCard = {
    title: string;
    description: string;
    icon: LucideIcon;
    image: LandingAsset;
    soon?: boolean;
};

/**
 * No icon: the image fades into the card's own color through `gradient`, and the copy sits on that fade.
 * The stops are the design's, rescaled to the full card: taken as-is they turn solid near 60% of the
 * height and bury the lower half of the image.
 */
export type CreativeToolCard = {
    title: string;
    description: string;
    image: LandingAsset;
    gradient: string;
    soon?: boolean;
};

export const COMING_SOON = {
    title: { before: "قريبًا على ", brand: "أعطيني" },
    description:
        "نعمل على أدوات جديدة تغطي رحلة محتواك كاملة، من الهوية البصرية إلى النشر والمتابعة.",
    contentTools: [
        {
            title: "حدد هويتك المرئية",
            description: "اختر ألوان ونمط محتواك في ثوانٍ لتضمن تناسق حسابك بالكامل.",
            icon: Palette,
            image: asset("soon-visual-identity.webp", "", 640, 548),
            soon: true,
        },
        {
            title: "خطة محتوى شهرية",
            description: "نظّم وجدول محتواك بكل احترافية لترتاح طوال الشهر.",
            icon: CalendarCheck2,
            image: asset("soon-content-plan.webp", "", 640, 548),
            soon: true,
        },
        {
            title: "رابطي",
            description: "أنشئ صفحة روابط تجمع كل قنواتك في رابط واحد.",
            icon: Link,
            image: asset("soon-link-page.webp", "", 640, 548),
            soon: true,
        },
        {
            title: "النشر عبر منصات التواصل",
            description:
                "انشر محتواك على منصات التواصل الاجتماعي وجدوِله من داخل أعطيني.",
            icon: Zap,
            image: asset("soon-publishing.webp", "", 640, 548),
            soon: true,
        },
        {
            title: "حوّل أفكارك إلى محتوى جاهز",
            description: "استخدم مولد المحتوى الذكي لإنشاء منشورات احترافية تناسب منتجاتك وخدماتك.",
            icon: Sparkles,
            image: asset("soon-content-generator.webp", "", 640, 548),
            soon: true,
        },
        {
            title: "خلّي وصف منتجك أكثر احترافية",
            description: "حوّل معلومات منتجاتك وخدماتك إلى وصف احترافي واضح وجاهز للنشر.",
            icon: PencilLine,
            image: asset("soon-product-description.webp", "", 640, 548),
            soon: true,
        },
        {
            title: "أضف منتجاتك أو خدماتك",
            description: "احفظ معلومات منتجاتك مرة واحدة واستخدمها دائمًا في كل منشور.",
            icon: PackagePlus,
            image: asset("soon-add-products.webp", "", 640, 548),
            soon: true,
        },
        {
            title: "تابع محتواك من مكان واحد",
            description: "أنشئ محتواك، وتابع ما تم إنجازه، واعرف ما لا يزال قيد الإنشاء.",
            icon: FolderMinus,
            image: asset("soon-content-tracking.webp", "", 640, 548),
            soon: true,
        },
    ] satisfies ComingSoonCard[],
    creativeTools: [
        {
            title: "تصميم إبداعي سريالي",
            description: "مشهد إبداعي لافت لمنتجك بأسلوب سريالي أو CGI.",
            image: asset("tool-surreal-design.webp", "", 614, 768),
            gradient: "linear-gradient(180deg, transparent 53.9%, var(--c2-neutral-100) 108.4%)",
            soon: true,
        },
        {
            title: "حملة كاملة",
            description: "أنشئ حملة متكاملة لمنتجاتك وخدماتك في دقائق وبسهولة.",
            image: asset("tool-full-campaign.webp", "", 960, 960),
            gradient: "linear-gradient(180.55deg, transparent 50%, var(--c2-periwinkle-300) 76.8%)",
            soon: true,
        },
        {
            title: "تحويل النص إلى صورة",
            description: "حوّل أفكارك وكلماتك إلى صور مميزة.",
            image: asset("tool-text-to-image.webp", "", 960, 960),
            gradient: "linear-gradient(180.56deg, transparent 50%, var(--c2-sky-320) 76.3%)",
            soon: true,
        },
        {
            title: "إزالة الخلفية",
            description: "أزل الخلفية من صورك في ثوانٍ.",
            image: asset("tool-background-removal.webp", "", 960, 960),
            gradient: "linear-gradient(180.53deg, transparent 50%, var(--c2-cyan-200) 78.1%)",
            soon: true,
        },
        {
            title: "كتابة سيناريو",
            description: "اكتب سيناريوهات جذابة لمحتواك وفيديوهاتك.",
            image: asset("tool-script-writing.webp", "", 960, 960),
            gradient: "linear-gradient(180.55deg, transparent 50%, var(--c2-sky-250) 76.7%)",
            soon: true,
        },
        {
            title: "فيديوهات UGC",
            description: "حوّل لقطاتك إلى فيديوهات جذابة باحترافية.",
            image: asset("tool-video-editing.webp", "", 960, 960),
            gradient: "linear-gradient(180deg, transparent 61.5%, var(--c2-sand-200) 84%)",
            soon: true,
        },
        {
            title: "صانع الكاروسيل",
            description: "أنشئ كاروسيلًا جذابًا يعرض أفكارك بطريقة مميزة.",
            image: asset("tool-carousel-maker.webp", "", 960, 960),
            gradient: "linear-gradient(180.78deg, transparent 53%, var(--c2-sky-400) 82.5%)",
            soon: true,
        },
        {
            title: "مصمم جرافيك",
            description: "صمّم محتوى احترافيًا يعبر عن علامتك التجارية.",
            image: asset("tool-graphic-designer.webp", "", 960, 960),
            gradient: "linear-gradient(180.76deg, transparent 53%, var(--c2-sky-300) 83.4%)",
            soon: true,
        },
        {
            title: "مصور احترافي",
            description: "أنشئ صورًا احترافية لمنتجاتك بسهولة.",
            image: asset("tool-photographer.webp", "", 960, 960),
            gradient: "linear-gradient(180.74deg, transparent 53%, var(--c2-taupe-200) 84.2%)",
            soon: true,
        },
    ] satisfies CreativeToolCard[],
};

export const OUTCOMES = {
    title: { before: "شو رح يغير بشغلك ", brand: "لما تفتح متجرك", after: "؟" },
    description:
        "كل الأدوات اللي بتحتاجها لتنظيم شغلك، الوصول لزبائن أكتر وزيادة فرص البيع، بمكان واحد.",
    items: [
        {
            title: "صفحة بيع قوية",
            description: "صفحة بيع قوية تساعدك على بيع المنتجات أو الخدمات بشكل احترافي ومقنع وجذاب.",
            image: asset("outcome-sales-page.png", "", 107, 86),
        },
        {
            title: "أسئلة أقل ووقت أكتر",
            description: "كل تفاصيل منتجاتك وخدماتك واضحة للزبائن، فتقل الأسئلة المتكررة.",
            image: asset("outcome-less-questions.png", "", 80, 80),
        },
        {
            title: "رح يزيد البيع عندك",
            description:
                "لأننا رح نشتغل على حملات إعلانية تساعد منتجاتك وخدماتك توصل لزبائن جدد وتزيد فرص البيع عندك.",
            image: asset("outcome-more-sales.png", "", 80, 80),
        },
        {
            title: "يصبح كل شغلك بمكان واحد",
            description:
                "كل منتجاتك وخدماتك وطلباتك بمكان واحد، تقدر تديرها وتنظمها بسهولة وتتابع شغلك من خلال متجر واحد.",
            image: asset("outcome-one-place.png", "", 87, 75),
        },
    ],
};

export const FINAL_CTA = {
    title: "افتح متجرك مجانًا على أعطيني، وخلي زبائن جدد يكتشفوا شغلك.",
    description:
        "ثلاث خطوات بسيطة تفصلك عن عرض منتجاتك وخدماتك في مكان واحد، يسهل على الزبائن الوصول إليه والتواصل معك.",
    cta: "أنشئ متجرك الآن",
};

export const WHATSAPP_URL = "https://wa.me/message/LBM5FKHA3MKLI1";
export const WHATSAPP_LABEL = "تواصل معنا عبر واتساب";
export const SOON_LABEL = "قريبًا";
