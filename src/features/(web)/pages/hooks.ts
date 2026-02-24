import { useQuery } from "@tanstack/react-query";
import { getTermsAndConditions, TermsAndConditionsResponse, getPrivacyPolicy, PrivacyPolicyResponse, getSafetyRules, SafetyRulesResponse, getFaqs, FaqsResponse } from "./api";

export const useGetTermsAndConditions = () => {
    return useQuery<TermsAndConditionsResponse, Error>({
        queryKey: ["termsAndConditions"],
        queryFn: getTermsAndConditions,
    });
};

export const useGetPrivacyPolicy = () => {
    return useQuery<PrivacyPolicyResponse, Error>({
        queryKey: ["privacyPolicy"],
        queryFn: getPrivacyPolicy,
    });
};

export const useGetSafetyRules = () => {
    return useQuery<SafetyRulesResponse, Error>({
        queryKey: ["safetyRules"],
        queryFn: getSafetyRules,
    });
};

export const useGetFaqs = () => {
    return useQuery<FaqsResponse, Error>({
        queryKey: ["faqs"],
        queryFn: getFaqs,
    });
};
