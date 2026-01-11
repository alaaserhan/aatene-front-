import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

// --- Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

// Common Image Structure
export interface ContentImage {
    image: string | null; // Path for upload/update
    image_url?: string | null; // URL for display
}

// 1. Content Interface Types
export interface SectionItem extends ContentImage {
    title: string;
    content: string;
}

export interface AboutUsSection extends ContentImage {
    content: string;
}

export interface VisionSection extends ContentImage {
    vision: string;
    message: string;
    goals: string;
}

export interface SegmentSection {
    title: string;
    content: string;
    sections: SectionItem[];
}

export interface ContentInterfaceData {
    section_intro_content: string;
    section_about_us: AboutUsSection;
    section_vision: VisionSection;
    section_why_us: SectionItem[];
    section_merchants: SegmentSection;
    section_customers: SegmentSection;
}

export interface ContentInterfaceResponse extends BaseResponse {
    data: ContentInterfaceData;
}

// 2. FAQs Types
export interface FAQItem extends ContentImage {
    question: string;
    answer: string;
    video?: string | null;
}

export interface FAQSection {
    title: string;
    faqs: FAQItem[];
}

export interface FAQsData {
    faq_sections: FAQSection[];
}

export interface FAQsResponse extends BaseResponse {
    data: FAQsData;
}

// 3. Safety Rules Types
export interface SafetyRuleSection extends ContentImage {
    title: string;
    content: string;
}

export interface KeepAccountSafe extends ContentImage {
    title: string;
    content: string;
    sections: SafetyRuleSection[];
}

export interface SimpleRuleItem extends ContentImage {
    title: string;
}

export interface SafetyRulesData {
    title: string;
    content: string;
    keep_account_save: KeepAccountSafe;
    merchants: SimpleRuleItem[];
    customers: SimpleRuleItem[];
}

export interface SafetyRulesResponse extends BaseResponse {
    data: {
        safety_rules: SafetyRulesData;
    };
}

export interface SafetyRulesRequest {
    safety_rules: SafetyRulesData;
}

// --- API Functions ---

// 1. Content Interface
export const getContentInterface = async (): Promise<ContentInterfaceResponse> => {
    const endpoint = getDynamicEndpoint("/content-interface");
    const { data } = await api.get<ContentInterfaceResponse>(endpoint);
    return data;
};

export const updateContentInterface = async (
    body: ContentInterfaceData
): Promise<ContentInterfaceResponse> => {
    const endpoint = getDynamicEndpoint("/content-interface");
    const { data } = await api.post<ContentInterfaceResponse>(endpoint, body);
    return data;
};

// 2. FAQs
export const getFAQs = async (): Promise<FAQsResponse> => {
    const endpoint = getDynamicEndpoint("/faqs");
    const { data } = await api.get<FAQsResponse>(endpoint);
    return data;
};

export const updateFAQs = async (body: FAQsData): Promise<FAQsResponse> => {
    const endpoint = getDynamicEndpoint("/faqs");
    const { data } = await api.post<FAQsResponse>(endpoint, body);
    return data;
};

// 3. Safety Rules
export const getSafetyRules = async (): Promise<SafetyRulesResponse> => {
    const endpoint = getDynamicEndpoint("/safety-rules");
    const { data } = await api.get<SafetyRulesResponse>(endpoint);
    return data;
};

export const updateSafetyRules = async (
    body: SafetyRulesRequest
): Promise<SafetyRulesResponse> => {
    const endpoint = getDynamicEndpoint("/safety-rules");
    const { data } = await api.post<SafetyRulesResponse>(endpoint, body);
    return data;
};