import { useQuery } from "@tanstack/react-query";
import { getTermsAndConditions, TermsAndConditionsResponse, getPrivacyPolicy, PrivacyPolicyResponse } from "./api";

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
