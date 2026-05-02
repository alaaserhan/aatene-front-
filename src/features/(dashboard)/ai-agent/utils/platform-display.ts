/**
 * تسميات عربية للقيم الشائعة التي تعيدها APIs (api1 overview، Laravel analytics).
 * أي قيمة غير معروفة تُعرض كما أرسلها الباك حتى لا يُدمَج سطران تحت نفس الاسم بالخطأ.
 */
const KNOWN_AR: Record<string, string> = {
    whatsapp: "واتساب",
    api4_whatsapp: "واتساب",
    instagram: "إنستغرام",
    messenger: "ماسنجر",
    facebook: "فيسبوك",
    /** يُعامل كـ «الموقع» مع website — نفس المصدر في المنتج */
    website: "الموقع",
    web: "الموقع",
    mobile: "الموبايل",
    "mobile_app": "الموبايل",
    meta_messenger: "ماسنجر",
};

export function formatPlatformLabel(platform: string | undefined | null): string {
    const raw = (platform ?? "").trim();
    if (!raw) return "—";
    return KNOWN_AR[raw.toLowerCase()] ?? raw;
}
