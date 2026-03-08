import api from "@/src/lib/axios";

export interface TermAndCondition {
    logo: string | null;
    title: { [key: string]: string };
    content: { [key: string]: string };
    logo_url: string | null;
}

export interface TermsAndConditionsResponse {
    status: boolean;
    message: string;
    termsAndConditions: TermAndCondition[];
}

export interface PrivacyPolicyResponse {
    status: boolean;
    message: string;
    privacyPolicy: TermAndCondition[];
}

export interface SafetyRuleSection {
    title: string;
    content: string;
    image: string;
    image_url: string;
}

export interface RuleActor {
    title: string;
    image: string;
    image_url: string;
}

export interface SafetyRulesData {
    title: string;
    content: string;
    keep_account_save: {
        title: string;
        content: string;
        sections: SafetyRuleSection[];
    };
    merchants: RuleActor[];
    customers: RuleActor[];
}

export interface SafetyRulesResponse {
    status: boolean;
    message: string;
    safetyRules: SafetyRulesData;
}

export interface FaqQuestion {
    question: string;
    answer: string;
    image: string | null;
    video: string | null;
    image_url: string | null;
    video_url: string | null;
}

export interface FaqCategory {
    title: string;
    faqs: FaqQuestion[];
}

export interface FaqsResponse {
    status: boolean;
    message: string;
    faqs: FaqCategory[];
}

export const getTermsAndConditions = async (): Promise<TermsAndConditionsResponse> => {
    const { data } = await api.get<TermsAndConditionsResponse>("/pages/terms-and-conditions");
    return data;
};

export const getPrivacyPolicy = async (): Promise<PrivacyPolicyResponse> => {
    const { data } = await api.get<PrivacyPolicyResponse>("/pages/privacy-policy");
    return data;
};

export const getSafetyRules = async (): Promise<SafetyRulesResponse> => {
    const { data } = await api.get<SafetyRulesResponse>("/pages/safety-rules");
    return data;
};

export const getFaqs = async (): Promise<FaqsResponse> => {
    const { data } = await api.get<FaqsResponse>("/pages/faqs");
    return data;
};

// ─── About Us ───────────────────────────────────────────────────────────────

export interface AboutUsVisionSection {
    vision: string;
    message: string;
    goals: string;
    image?: string | null;
    image_url?: string | null;
}

export interface AboutUsWhyUsItem {
    title: string;
    content: string;
    image?: string | null;
    image_url?: string | null;
}

export interface AboutUsMerchantSection {
    title: string;
    content: string;
    image?: string | null;
    image_url?: string | null;
}

export interface AboutUsMerchants {
    title?: string;
    content?: string;
    sections?: AboutUsMerchantSection[];
}

export interface AboutUsCustomers {
    title?: string;
    content?: string;
    sections?: AboutUsMerchantSection[];
}

export interface AboutUsSection {
    content?: string;
    image?: string | null;
    image_url?: string | null;
}

export interface AboutUsData {
    sectionIntroContent?: string | null;
    sectionAboutUs?: AboutUsSection | null;
    sectionVision?: AboutUsVisionSection | null;
    sectionWhyUs?: AboutUsWhyUsItem[];
    sectionMerchants?: AboutUsMerchants | null;
    sectionCustomers?: AboutUsCustomers | null;
}

export interface AboutUsResponse {
    status: boolean;
    message: string;
    aboutUs: AboutUsData;
}

export const getAboutUs = async (): Promise<AboutUsResponse> => {
    const { data } = await api.get<AboutUsResponse>("/pages/about-us");
    return data;
};

// ─── Contact Us ─────────────────────────────────────────────────────────────

export interface ContactUsPayload {
    name: string;
    email: string;
    message: string;
}

export interface ContactUsResponse {
    status: boolean;
    message: string;
}

export const sendContact = async (payload: ContactUsPayload): Promise<ContactUsResponse> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);
    formData.append("message", payload.message);
    const { data } = await api.post<ContactUsResponse>("/contacts", formData);
    return data;
};
