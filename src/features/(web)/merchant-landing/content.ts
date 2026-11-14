import type { LucideIcon } from "lucide-react";
import {
    Box,
    CalendarCheck,
    Camera,
    Eraser,
    FolderMinus,
    GalleryHorizontal,
    Link2,
    Palette,
    PenTool,
    Shirt,
    Sparkles,
    WandSparkles,
    Zap,
} from "lucide-react";

/** Files live in `public/merchant-landing/`; a missing file renders a labelled placeholder. */
export type LandingAsset = {
    src: string;
    alt: string;
    width: number;
    height: number;
};

const asset = (file: string, alt: string, width: number, height: number): LandingAsset => ({
    src: `/merchant-landing/${file}`,
    alt,
    width,
    height,
});

export const HERO = {
    title: "افتح متجرك الإلكتروني مجانًا، وسهّل على زبائن جدد اكتشاف منتجاتك وخدماتك.",
    description:
        "مع أعطيني، أصبح لديك مكان واحد تعرض فيه منتجاتك أو خدماتك بالصور والأسعار والتفاصيل، ويسهل على الزبائن اكتشاف متجرك والتواصل معك.",
    cta: "أنشئ متجرك الآن",
    mockup: asset("hero-mockup.webp", "صفحة متجر على أعطيني تظهر على الحاسوب والهاتف", 1440, 809),
};

export const HEADER_CTA = "أنشئ متجرك مجانًا";

export const TRUST_POINTS = [
    "إنشاء مجاني 100%",
    "بدون رسوم تسجيل أو اشتراك",
    "بدون عمولة على المبيعات",
];

export type BenefitTone = "navy" | "sky" | "white" | "muted";

export const BENEFITS = {
    title: "ما الذي ستستفيده عند فتح متجرك على أعطيني؟",
    description: "مع أعطيني، تزداد فرص ظهور منتجاتك وخدماتك أمام من يبحثون عمّا تقدّمه.",
    items: [
        {
            tone: "navy" as BenefitTone,
            title: "زبائن جدد يكتشفون عملك",
            description:
                "يظهر متجرك أمام الباحثين عن منتجات وخدمات مثل التي تقدّمها، فتصل إلى زبائن لم يكونوا ليعرفوك من قبل.",
            image: asset("benefit-new-customers.webp", "", 61, 61),
        },
        {
            tone: "sky" as BenefitTone,
            title: "كل منتجاتك وخدماتك في مكان واحد",
            description:
                "بدلًا من إرسال الصور والأسعار لكل زبون على حدة، اعرض كل التفاصيل في متجرك، ودع الزبائن يطّلعون على ما تقدّمه في أي وقت.",
            image: asset("benefit-one-place.webp", "", 61, 61),
        },
        {
            tone: "white" as BenefitTone,
            title: "تواصل أسهل مع الزبائن",
            description:
                "استقبل رسائل الزبائن وطلبات الأسعار في مكان واحد، وتابع استفساراتهم بسهولة.",
            image: asset("benefit-contact.webp", "", 61, 61),
        },
        {
            tone: "muted" as BenefitTone,
            title: "متجر منظّم يعكس عملك",
            description:
                "دع الزبائن يتعرّفون على مشروعك من خلال صور المنتجات والمعلومات الواضحة والتقييمات المتاحة، ليختاروا ما يناسبهم بثقة أكبر.",
            image: asset("benefit-organized.webp", "", 61, 61),
        },
    ],
};

export const SHOWCASE = {
    title: "اعرض منتجاتك وخدماتك مجانًا.",
    items: [
        "أضف منتجاتك أو خدماتك بسهولة.",
        "اعرض الصور والأسعار والتفاصيل.",
        "نظّم المنتجات ضمن التصنيفات.",
        "استقبل استفسارات الزبائن وتواصل معهم.",
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

export const COMING_SOON = {
    title: "قريبًا على أعطيني",
    description:
        "نعمل على أدوات جديدة تغطي رحلة محتواك كاملة، من الهوية البصرية إلى النشر والمتابعة.",
    contentTools: [
        {
            title: "تابع محتواك من مكان واحد",
            description: "أنشئ محتواك، وتابع ما أُنجز وما يزال قيد الإنشاء.",
            icon: FolderMinus,
            image: asset("soon-content-tracking.webp", "", 302, 254),
        },
        {
            title: "أضف منتجاتك أو خدماتك",
            description: "احفظ معلومات منتجاتك مرة واحدة واستخدمها في كل منشور.",
            icon: Box,
            image: asset("soon-products.webp", "", 302, 254),
        },
        {
            title: "اجعل وصف منتجك أكثر احترافية",
            description: "حوّل معلومات منتجاتك وخدماتك إلى وصف احترافي واضح وجاهز للنشر.",
            icon: WandSparkles,
            image: asset("soon-description.webp", "", 302, 254),
        },
        {
            title: "حوّل أفكارك إلى محتوى جاهز",
            description: "استخدم مولّد المحتوى الذكي لإنشاء منشورات احترافية تناسب منتجاتك وخدماتك.",
            icon: Sparkles,
            image: asset("soon-content-generator.webp", "", 302, 254),
        },
        {
            title: "النشر عبر منصات التواصل",
            description: "انشر محتواك على منصات التواصل الاجتماعي وجدوِله من داخل أعطيني.",
            icon: Zap,
            image: asset("soon-publishing.webp", "", 302, 254),
        },
        {
            title: "رابطي",
            description: "أنشئ صفحة روابط تجمع كل قنواتك في رابط واحد.",
            icon: Link2,
            image: asset("soon-link-page.webp", "", 302, 254),
        },
        {
            title: "خطة محتوى شهرية",
            description: "نظّم محتواك وجدوِله باحترافية لترتاح طوال الشهر.",
            icon: CalendarCheck,
            image: asset("soon-content-plan.webp", "", 302, 254),
        },
        {
            title: "حدّد هويتك المرئية",
            description: "اختر ألوان محتواك ونمطه في ثوانٍ لتضمن تناسق حسابك بالكامل.",
            icon: Palette,
            image: asset("soon-visual-identity.webp", "", 302, 254),
        },
    ] satisfies ComingSoonCard[],
    creativeTools: [
        {
            title: "صانع الكاروسيل",
            description: "أنشئ كاروسيلًا جذابًا يعرض أفكارك بطريقة مميزة.",
            icon: GalleryHorizontal,
            image: asset("tool-carousel-maker.webp", "", 304, 230),
            soon: true,
        },
        {
            title: "تنسيق الأزياء",
            description: "نسّق إطلالاتك واختر القطع المناسبة بسهولة.",
            icon: Shirt,
            image: asset("tool-fashion-styling.webp", "", 304, 230),
            soon: true,
        },
        {
            title: "مصمم جرافيك",
            description: "صمّم محتوى احترافيًا يعبّر عن علامتك التجارية.",
            icon: PenTool,
            image: asset("tool-graphic-designer.webp", "", 304, 230),
            soon: true,
        },
        {
            title: "مصوّر احترافي",
            description: "أنشئ صورًا احترافية لمنتجاتك بسهولة.",
            icon: Camera,
            image: asset("tool-photographer.webp", "", 304, 230),
            soon: true,
        },
        {
            title: "إزالة الخلفية",
            description: "أزل الخلفية من صورك في ثوانٍ.",
            icon: Eraser,
            image: asset("tool-background-removal.webp", "", 304, 230),
        },
    ] satisfies ComingSoonCard[],
};

export const OUTCOMES = {
    title: "ما الذي سيتغيّر في عملك عند فتح متجرك؟",
    description:
        "كل الأدوات التي تحتاجها لتنظيم عملك، والوصول إلى زبائن أكثر، وزيادة فرص البيع، في مكان واحد.",
    items: [
        {
            title: "يصبح كل عملك في مكان واحد",
            description: "منتجاتك وخدماتك ورسائل زبائنك في لوحة واحدة، فلا تضيع بين التطبيقات والمحادثات.",
            image: asset("outcome-one-place.webp", "", 107, 86),
        },
        {
            title: "تزداد مبيعاتك",
            description: "ظهور أوسع أمام زبائن يبحثون عمّا تقدّمه يعني فرصًا أكثر للبيع كل يوم.",
            image: asset("outcome-more-sales.webp", "", 87, 75),
        },
        {
            title: "أسئلة أقل ووقت أكثر",
            description: "يجد الزبون الأسعار والتفاصيل في متجرك مباشرة، فتقلّ الأسئلة المتكررة ويتوفر وقتك.",
            image: asset("outcome-less-questions.webp", "", 80, 80),
        },
        {
            title: "صفحة بيع قوية",
            description: "صفحة متجر احترافية تعرض عملك بأفضل صورة وتمنح الزبائن ثقة أكبر في الشراء منك.",
            image: asset("outcome-sales-page.webp", "", 80, 80),
        },
    ],
};

export const FINAL_CTA = {
    title: "افتح متجرك مجانًا على أعطيني، ودع زبائن جددًا يكتشفون عملك.",
    description:
        "ثلاث خطوات بسيطة تفصلك عن عرض منتجاتك وخدماتك في مكان واحد، يسهل على الزبائن الوصول إليه والتواصل معك.",
    cta: "أنشئ متجرك الآن",
};

/** TODO: replace with the real support number (international format, digits only). */
export const WHATSAPP_NUMBER = "";
export const WHATSAPP_LABEL = "تواصل معنا عبر واتساب";
