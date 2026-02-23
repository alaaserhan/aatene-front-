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

export const getTermsAndConditions = async (): Promise<TermsAndConditionsResponse> => {
    const { data } = await api.get<TermsAndConditionsResponse>("/pages/terms-and-conditions");
    return data;
};

export const getPrivacyPolicy = async (): Promise<PrivacyPolicyResponse> => {
    const { data } = await api.get<PrivacyPolicyResponse>("/pages/privacy-policy");
    return data;
};
