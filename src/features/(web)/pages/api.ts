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
