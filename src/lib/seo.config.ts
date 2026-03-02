import { Metadata } from "next";

const SITE_NAME = "أعطيني | Aatene";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aatene.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-logo.png`;

interface PageSEO {
    title: string;
    description: string;
    keywords?: string[];
}

export const PAGE_SEO: Record<string, PageSEO> = {
    home: {
        title: "الصفحة الرئيسية",
        description:
            "أعطيني - منصة إلكترونية تربط بين مزوّدي الخدمات وبائعي المنتجات المحليين مع الزبائن. اكتشف خدمات ومنتجات محلية بسهولة وسرعة.",
        keywords: [
            "أعطيني",
            "خدمات محلية",
            "منتجات محلية",
            "بيع وشراء",
            "منصة إلكترونية",
            "aatene",
        ],
    },
    login: {
        title: "تسجيل الدخول",
        description:
            "سجّل دخولك إلى حسابك في أعطيني للوصول إلى خدماتك ومنتجاتك المفضلة.",
        keywords: ["تسجيل دخول", "أعطيني", "حساب"],
    },
    signup: {
        title: "إنشاء حساب جديد",
        description:
            "أنشئ حسابك في أعطيني مجاناً وابدأ رحلتك في بيع وشراء الخدمات والمنتجات المحلية.",
        keywords: ["تسجيل", "حساب جديد", "أعطيني"],
    },
    forgotPassword: {
        title: "استعادة كلمة المرور",
        description:
            "استعد كلمة المرور الخاصة بحسابك في أعطيني واستكمل تسوقك بسهولة.",
        keywords: ["استعادة كلمة المرور", "أعطيني"],
    },
    about: {
        title: "من نحن",
        description:
            "تعرّف على قصة أعطيني - منصة محلية انطلقت من الناصرة لدعم المشاريع الصغيرة وربط المجتمع المحلي.",
        keywords: ["من نحن", "أعطيني", "الناصرة", "مشاريع صغيرة"],
    },
    search: {
        title: "البحث",
        description:
            "ابحث عن منتجات وخدمات محلية في أعطيني. تصفح آلاف العروض والخدمات من مزوّدين موثوقين.",
        keywords: ["بحث", "منتجات", "خدمات", "أعطيني"],
    },
    chat: {
        title: "المحادثات",
        description:
            "تواصل مع البائعين ومزوّدي الخدمات مباشرة عبر محادثات أعطيني الفورية.",
        keywords: ["محادثات", "تواصل", "أعطيني"],
    },
    favourites: {
        title: "المفضلة",
        description:
            "تصفح قائمة منتجاتك وخدماتك المفضلة المحفوظة في أعطيني.",
        keywords: ["المفضلة", "منتجات محفوظة", "أعطيني"],
    },
    notifications: {
        title: "الإشعارات",
        description:
            "تابع إشعاراتك وآخر التحديثات على حسابك في أعطيني.",
        keywords: ["إشعارات", "تنبيهات", "أعطيني"],
    },
    settings: {
        title: "الإعدادات",
        description:
            "إدارة إعدادات حسابك الشخصي وتفضيلاتك في أعطيني.",
        keywords: ["إعدادات", "حساب", "أعطيني"],
    },
    blogs: {
        title: "المدونة",
        description:
            "اقرأ أحدث المقالات والنصائح حول التجارة المحلية والخدمات على مدونة أعطيني.",
        keywords: ["مدونة", "مقالات", "أعطيني", "نصائح"],
    },
    compare: {
        title: "المقارنة",
        description:
            "قارن بين المنتجات والخدمات المختلفة في أعطيني واختر الأنسب لك.",
        keywords: ["مقارنة", "منتجات", "خدمات", "أعطيني"],
    },
    contactUs: {
        title: "اتصل بنا",
        description:
            "تواصل مع فريق أعطيني لأي استفسار أو دعم. نحن هنا لمساعدتك.",
        keywords: ["اتصل بنا", "تواصل", "دعم", "أعطيني"],
    },
    faq: {
        title: "الأسئلة الشائعة",
        description:
            "إجابات على الأسئلة الأكثر شيوعاً حول منصة أعطيني وكيفية استخدامها.",
        keywords: ["أسئلة شائعة", "مساعدة", "أعطيني"],
    },
    privacyPolicy: {
        title: "سياسة الخصوصية",
        description:
            "اطّلع على سياسة الخصوصية الخاصة بمنصة أعطيني وكيف نحمي بياناتك.",
        keywords: ["سياسة الخصوصية", "حماية البيانات", "أعطيني"],
    },
    termsOfUse: {
        title: "شروط الاستخدام",
        description:
            "اقرأ شروط وأحكام استخدام منصة أعطيني.",
        keywords: ["شروط الاستخدام", "أحكام", "أعطيني"],
    },
    safetyRules: {
        title: "قواعد السلامة",
        description:
            "تعرّف على إرشادات وقواعد السلامة في منصة أعطيني للتسوق الآمن.",
        keywords: ["قواعد السلامة", "تسوق آمن", "أعطيني"],
    },
    requestedServices: {
        title: "الخدمات المطلوبة",
        description:
            "تصفح الخدمات المطلوبة من المستخدمين وقدّم عروضك في أعطيني.",
        keywords: ["خدمات مطلوبة", "عروض", "أعطيني"],
    },
    createRequestedService: {
        title: "طلب خدمة جديدة",
        description:
            "أنشئ طلب خدمة جديدة واحصل على عروض من مزوّدي الخدمات في منطقتك.",
        keywords: ["طلب خدمة", "أعطيني"],
    },
    reportCreate: {
        title: "إنشاء بلاغ",
        description: "قدّم بلاغ عن محتوى مخالف على منصة أعطيني.",
        keywords: ["بلاغ", "تقرير", "أعطيني"],
    },
    reportInquiry: {
        title: "استفسار عن بلاغ",
        description: "تابع حالة البلاغات التي قدّمتها على منصة أعطيني.",
        keywords: ["استفسار", "بلاغ", "أعطيني"],
    },

    dashboardHome: {
        title: "لوحة التحكم",
        description: "لوحة التحكم الخاصة بك في أعطيني - إدارة متجرك وخدماتك.",
        keywords: ["لوحة تحكم", "إدارة", "أعطيني"],
    },
    dashboardProducts: {
        title: "المنتجات",
        description: "إدارة منتجاتك وعرضها على منصة أعطيني.",
        keywords: ["منتجات", "إدارة", "أعطيني"],
    },
    dashboardAddProduct: {
        title: "إضافة منتج",
        description: "أضف منتج جديد إلى متجرك على منصة أعطيني.",
        keywords: ["إضافة منتج", "أعطيني"],
    },
    dashboardChat: {
        title: "المحادثات",
        description: "إدارة محادثاتك مع العملاء في لوحة تحكم أعطيني.",
        keywords: ["محادثات", "عملاء", "أعطيني"],
    },
    dashboardCoupons: {
        title: "الكوبونات",
        description: "إنشاء وإدارة كوبونات الخصم في متجرك على أعطيني.",
        keywords: ["كوبونات", "خصم", "أعطيني"],
    },
    dashboardCategories: {
        title: "التصنيفات",
        description: "إدارة تصنيفات المنتجات والخدمات في لوحة تحكم أعطيني.",
        keywords: ["تصنيفات", "إدارة", "أعطيني"],
    },
    dashboardBanners: {
        title: "البانرات",
        description: "إدارة البانرات الإعلانية على منصة أعطيني.",
        keywords: ["بانرات", "إعلانات", "أعطيني"],
    },
    dashboardBlogs: {
        title: "المدونة",
        description: "إدارة مقالات المدونة في لوحة تحكم أعطيني.",
        keywords: ["مدونة", "مقالات", "أعطيني"],
    },
    dashboardStores: {
        title: "المتاجر",
        description: "إدارة المتاجر المسجلة على منصة أعطيني.",
        keywords: ["متاجر", "إدارة", "أعطيني"],
    },
    dashboardUsers: {
        title: "المستخدمون",
        description: "إدارة حسابات المستخدمين على منصة أعطيني.",
        keywords: ["مستخدمون", "حسابات", "أعطيني"],
    },
    dashboardNotifications: {
        title: "الإشعارات",
        description: "إدارة وإرسال الإشعارات في لوحة تحكم أعطيني.",
        keywords: ["إشعارات", "إدارة", "أعطيني"],
    },
    dashboardSettings: {
        title: "إعدادات المتجر",
        description: "إدارة إعدادات متجرك وتفضيلاتك في أعطيني.",
        keywords: ["إعدادات", "متجر", "أعطيني"],
    },
    dashboardFinancial: {
        title: "السجل المالي",
        description: "تابع السجل المالي والمعاملات في لوحة تحكم أعطيني.",
        keywords: ["سجل مالي", "معاملات", "أعطيني"],
    },
    dashboardCoins: {
        title: "شراء عملات",
        description: "شراء عملات أعطيني لاستخدامها في الترويج والإعلان.",
        keywords: ["عملات", "شراء", "أعطيني"],
    },
    dashboardFavorites: {
        title: "المفضلة",
        description: "إدارة قوائم المفضلة في لوحة تحكم أعطيني.",
        keywords: ["مفضلة", "إدارة", "أعطيني"],
    },
    dashboardFollowing: {
        title: "المتابعة",
        description: "إدارة قوائم المتابعة في لوحة تحكم أعطيني.",
        keywords: ["متابعة", "إدارة", "أعطيني"],
    },
    dashboardReports: {
        title: "البلاغات",
        description: "عرض وإدارة البلاغات في لوحة تحكم أعطيني.",
        keywords: ["بلاغات", "أعطيني"],
    },
    dashboardAllReports: {
        title: "جميع البلاغات",
        description: "عرض جميع البلاغات في لوحة تحكم أعطيني.",
        keywords: ["بلاغات", "أعطيني"],
    },
    dashboardServiceProviders: {
        title: "مزودو الخدمات",
        description: "إدارة مزوّدي الخدمات المسجلين على منصة أعطيني.",
        keywords: ["مزودو خدمات", "إدارة", "أعطيني"],
    },
    dashboardProductProviders: {
        title: "مزودو المنتجات",
        description: "إدارة مزوّدي المنتجات المسجلين على منصة أعطيني.",
        keywords: ["مزودو منتجات", "إدارة", "أعطيني"],
    },
    dashboardRequestedServices: {
        title: "الخدمات المطلوبة",
        description: "إدارة طلبات الخدمات في لوحة تحكم أعطيني.",
        keywords: ["خدمات مطلوبة", "إدارة", "أعطيني"],
    },
    dashboardSections: {
        title: "الأقسام",
        description: "إدارة أقسام الصفحة الرئيسية في لوحة تحكم أعطيني.",
        keywords: ["أقسام", "إدارة", "أعطيني"],
    },
    dashboardCities: {
        title: "المدن",
        description: "إدارة المدن والمناطق على منصة أعطيني.",
        keywords: ["مدن", "مناطق", "أعطيني"],
    },
    dashboardContentManagement: {
        title: "إدارة المحتوى",
        description: "إدارة المحتوى النصي والصفحات الثابتة في أعطيني.",
        keywords: ["إدارة محتوى", "أعطيني"],
    },
    dashboardAbusiveWords: {
        title: "الكلمات المسيئة",
        description: "إدارة قائمة الكلمات المسيئة والفلتر في أعطيني.",
        keywords: ["كلمات مسيئة", "فلتر", "أعطيني"],
    },
    dashboardPermissions: {
        title: "الصلاحيات",
        description: "إدارة صلاحيات المشرفين في لوحة تحكم أعطيني.",
        keywords: ["صلاحيات", "مشرفين", "أعطيني"],
    },
    dashboardMosa3edy: {
        title: "مساعدي",
        description: "إدارة المساعد الذكي في لوحة تحكم أعطيني.",
        keywords: ["مساعدي", "ذكاء اصطناعي", "أعطيني"],
    },
    dashboard403: {
        title: "غير مصرح",
        description: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
        keywords: ["غير مصرح", "أعطيني"],
    },
    dashboardReportsDetails: {
        title: "تفاصيل البلاغ",
        description: "تفاصيل البلاغ",
        keywords: ["تفاصيل", "تقرير", "أعطيني"],
    },
    dashboardUsersAdd: {
        title: "إضافة مستخدم",
        description: "إضافة مستخدم جديد",
        keywords: ["إضافة", "مستخدم", "أعطيني"],
    },
};

export function generatePageMetadata(
    pageKey: string,
    overrides?: Partial<Metadata>
): Metadata {
    const page = PAGE_SEO[pageKey];

    if (!page) {
        return {
            title: {
                default: SITE_NAME,
                template: `%s | ${SITE_NAME}`,
            },
            ...overrides,
        };
    }

    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        openGraph: {
            title: `${page.title} | ${SITE_NAME}`,
            description: page.description,
            siteName: SITE_NAME,
            url: SITE_URL,
            type: "website",
            images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${page.title} | ${SITE_NAME}`,
            description: page.description,
            images: [DEFAULT_OG_IMAGE],
        },
        ...overrides,
    };
}

export function generateDynamicMetadata({
    title,
    description,
    image,
    url,
}: {
    title: string;
    description: string;
    image?: string;
    url?: string;
}): Metadata {
    const ogImage = image || DEFAULT_OG_IMAGE;
    return {
        title,
        description,
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            siteName: SITE_NAME,
            url: url || SITE_URL,
            type: "website",
            images: [{ url: ogImage, width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${SITE_NAME}`,
            description,
            images: [ogImage],
        },
    };
}

export { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE };
