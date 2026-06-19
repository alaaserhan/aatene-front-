import { Metadata } from "next";
import { locales, defaultLocale } from "@/src/i18n/config";

const SITE_NAME = "أعطيني | Aatene";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aatene.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

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
    },
    login: {
        title: "تسجيل الدخول",
        description:
            "سجّل دخولك إلى حسابك في أعطيني للوصول إلى خدماتك ومنتجاتك المفضلة.",
    },
    signup: {
        title: "إنشاء حساب جديد",
        description:
            "أنشئ حسابك في أعطيني مجاناً وابدأ رحلتك في بيع وشراء الخدمات والمنتجات المحلية.",
    },
    forgotPassword: {
        title: "استعادة كلمة المرور",
        description:
            "استعد كلمة المرور الخاصة بحسابك في أعطيني واستكمل تسوقك بسهولة.",
    },
    about: {
        title: "من نحن",
        description:
            "تعرّف على قصة أعطيني - منصة محلية انطلقت من الناصرة لدعم المشاريع الصغيرة وربط المجتمع المحلي.",
    },
    search: {
        title: "البحث",
        description:
            "ابحث عن منتجات وخدمات محلية في أعطيني. تصفح آلاف العروض والخدمات من مزوّدين موثوقين.",
    },
    chat: {
        title: "المحادثات",
        description:
            "تواصل مع البائعين ومزوّدي الخدمات مباشرة عبر محادثات أعطيني الفورية.",
    },
    favourites: {
        title: "المفضلة",
        description:
            "تصفح قائمة منتجاتك وخدماتك المفضلة المحفوظة في أعطيني.",
    },
    notifications: {
        title: "الإشعارات",
        description:
            "تابع إشعاراتك وآخر التحديثات على حسابك في أعطيني.",
    },
    settings: {
        title: "الإعدادات",
        description:
            "إدارة إعدادات حسابك الشخصي وتفضيلاتك في أعطيني.",
    },
    blogs: {
        title: "المدونة",
        description:
            "اقرأ أحدث المقالات والنصائح حول التجارة المحلية والخدمات على مدونة أعطيني.",
    },
    compare: {
        title: "المقارنة",
        description:
            "قارن بين المنتجات والخدمات المختلفة في أعطيني واختر الأنسب لك.",
    },
    contactUs: {
        title: "اتصل بنا",
        description:
            "تواصل مع فريق أعطيني لأي استفسار أو دعم. نحن هنا لمساعدتك.",
    },
    faq: {
        title: "الأسئلة الشائعة",
        description:
            "إجابات على الأسئلة الأكثر شيوعاً حول منصة أعطيني وكيفية استخدامها.",
    },
    privacyPolicy: {
        title: "سياسة الخصوصية",
        description:
            "اطّلع على سياسة الخصوصية الخاصة بمنصة أعطيني وكيف نحمي بياناتك.",
    },
    termsOfUse: {
        title: "شروط الاستخدام",
        description:
            "اقرأ شروط وأحكام استخدام منصة أعطيني.",
    },
    safetyRules: {
        title: "قواعد السلامة",
        description:
            "تعرّف على إرشادات وقواعد السلامة في منصة أعطيني للتسوق الآمن.",
    },
    requestedServices: {
        title: "الخدمات المطلوبة",
        description:
            "تصفح الخدمات المطلوبة من المستخدمين وقدّم عروضك في أعطيني.",
    },
    createRequestedService: {
        title: "طلب خدمة جديدة",
        description:
            "أنشئ طلب خدمة جديدة واحصل على عروض من مزوّدي الخدمات في منطقتك.",
    },
    reportCreate: {
        title: "إنشاء بلاغ",
        description: "قدّم بلاغ عن محتوى مخالف على منصة أعطيني.",
    },
    reportInquiry: {
        title: "استفسار عن بلاغ",
        description: "تابع حالة البلاغات التي قدّمتها على منصة أعطيني.",
    },

    dashboardHome: {
        title: "لوحة التحكم",
        description: "لوحة التحكم الخاصة بك في أعطيني - إدارة متجرك وخدماتك.",
    },
    dashboardProducts: {
        title: "المنتجات",
        description: "إدارة منتجاتك وعرضها على منصة أعطيني.",
    },
    dashboardAddProduct: {
        title: "إضافة منتج",
        description: "أضف منتج جديد إلى متجرك على منصة أعطيني.",
    },
    dashboardChat: {
        title: "المحادثات",
        description: "إدارة محادثاتك مع العملاء في لوحة تحكم أعطيني.",
    },
    dashboardCoupons: {
        title: "الكوبونات",
        description: "إنشاء وإدارة كوبونات الخصم في متجرك على أعطيني.",
    },
    dashboardCategories: {
        title: "التصنيفات",
        description: "إدارة تصنيفات المنتجات والخدمات في لوحة تحكم أعطيني.",
    },
    dashboardBanners: {
        title: "البانرات",
        description: "إدارة البانرات الإعلانية على منصة أعطيني.",
    },
    dashboardBlogs: {
        title: "المدونة",
        description: "إدارة مقالات المدونة في لوحة تحكم أعطيني.",
    },
    dashboardStores: {
        title: "المتاجر",
        description: "إدارة المتاجر المسجلة على منصة أعطيني.",
    },
    dashboardUsers: {
        title: "المستخدمون",
        description: "إدارة حسابات المستخدمين على منصة أعطيني.",
    },
    dashboardNotifications: {
        title: "الإشعارات",
        description: "إدارة وإرسال الإشعارات في لوحة تحكم أعطيني.",
    },
    dashboardSettings: {
        title: "إعدادات المتجر",
        description: "إدارة إعدادات متجرك وتفضيلاتك في أعطيني.",
    },
    dashboardFinancial: {
        title: "السجل المالي",
        description: "تابع السجل المالي والمعاملات في لوحة تحكم أعطيني.",
    },
    dashboardCoins: {
        title: "شراء عملات",
        description: "شراء عملات أعطيني لاستخدامها في الترويج والإعلان.",
    },
    dashboardFavorites: {
        title: "المفضلة",
        description: "إدارة قوائم المفضلة في لوحة تحكم أعطيني.",
    },
    dashboardFollowing: {
        title: "المتابعة",
        description: "إدارة قوائم المتابعة في لوحة تحكم أعطيني.",
    },
    dashboardReports: {
        title: "البلاغات",
        description: "عرض وإدارة البلاغات في لوحة تحكم أعطيني.",
    },
    dashboardAllReports: {
        title: "جميع البلاغات",
        description: "عرض جميع البلاغات في لوحة تحكم أعطيني.",
    },
    dashboardServiceProviders: {
        title: "مزودو الخدمات",
        description: "إدارة مزوّدي الخدمات المسجلين على منصة أعطيني.",
    },
    dashboardProductProviders: {
        title: "مزودو المنتجات",
        description: "إدارة مزوّدي المنتجات المسجلين على منصة أعطيني.",
    },
    dashboardRequestedServices: {
        title: "الخدمات المطلوبة",
        description: "إدارة طلبات الخدمات في لوحة تحكم أعطيني.",
    },
    dashboardSections: {
        title: "الأقسام",
        description: "إدارة أقسام الصفحة الرئيسية في لوحة تحكم أعطيني.",
    },
    dashboardCities: {
        title: "المدن",
        description: "إدارة المدن والمناطق على منصة أعطيني.",
    },
    dashboardContentManagement: {
        title: "إدارة المحتوى",
        description: "إدارة المحتوى النصي والصفحات الثابتة في أعطيني.",
    },
    dashboardAbusiveWords: {
        title: "الكلمات المسيئة",
        description: "إدارة قائمة الكلمات المسيئة والفلتر في أعطيني.",
    },
    dashboardPermissions: {
        title: "الصلاحيات",
        description: "إدارة صلاحيات المشرفين في لوحة تحكم أعطيني.",
    },
    dashboardMosa3edy: {
        title: "مساعدي",
        description: "إدارة المساعد الذكي في لوحة تحكم أعطيني.",
    },
    dashboard403: {
        title: "غير مصرح",
        description: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
    },
    dashboardReportsDetails: {
        title: "تفاصيل البلاغ",
        description: "تفاصيل البلاغ",
    },
    dashboardUsersAdd: {
        title: "إضافة مستخدم",
        description: "إضافة مستخدم جديد",
    },
    dashboardContacts: {
        title: "رسائل التواصل",
        description: "الرسائل المُرسلة من صفحة من نحن",
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

export function generateAlternates(locale: string, pathname: string) {
    const languages: Record<string, string> = {};
    for (const loc of locales) {
        languages[loc] = `${SITE_URL}/${loc}${pathname}`;
    }
    languages["x-default"] = `${SITE_URL}/${defaultLocale}${pathname}`;

    return {
        canonical: `${SITE_URL}/${locale}${pathname}`,
        languages,
    };
}

export { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE };
