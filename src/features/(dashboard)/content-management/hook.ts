"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";

interface MutationCallbacks {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

// --- Content Interface Hooks ---

export function useGetContentInterface() {
    return useQuery({
        queryKey: ["content-management", "interface"],
        queryFn: api.getContentInterface,
    });
}

export function useUpdateContentInterface(callbacks?: MutationCallbacks) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: api.ContentInterfaceData) => api.updateContentInterface(body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["content-management", "interface"] });
            callbacks?.onSuccess?.(data.message || "Content interface updated successfully");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            callbacks?.onError?.(error?.response?.data?.message || "Failed to update content interface");
        },
    });
}

// --- FAQs Hooks ---

export function useGetFAQs() {
    return useQuery({
        queryKey: ["content-management", "faqs"],
        queryFn: api.getFAQs,
    });
}

export function useUpdateFAQs(callbacks?: MutationCallbacks) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: api.FAQsData) => api.updateFAQs(body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["content-management", "faqs"] });
            callbacks?.onSuccess?.(data.message || "FAQs updated successfully");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            callbacks?.onError?.(error?.response?.data?.message || "Failed to update FAQs");
        },
    });
}

// --- Safety Rules Hooks ---

export function useGetSafetyRules() {
    return useQuery({
        queryKey: ["content-management", "safety-rules"],
        queryFn: api.getSafetyRules,
    });
}

export function useUpdateSafetyRules(callbacks?: MutationCallbacks) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: api.SafetyRulesRequest) => api.updateSafetyRules(body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["content-management", "safety-rules"] });
            callbacks?.onSuccess?.(data.message || "Safety rules updated successfully");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            callbacks?.onError?.(error?.response?.data?.message || "Failed to update safety rules");
        },
    });
}
