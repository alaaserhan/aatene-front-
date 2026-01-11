"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";

// --- Content Interface Hooks ---

export function useGetContentInterface() {
    return useQuery({
        queryKey: ["content-management", "interface"],
        queryFn: api.getContentInterface,
    });
}

export function useUpdateContentInterface() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: api.ContentInterfaceData) => api.updateContentInterface(body),
        onSuccess: (data) => {
            toast.success(data.message || "Content interface updated successfully");
            queryClient.invalidateQueries({ queryKey: ["content-management", "interface"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update content interface");
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

export function useUpdateFAQs() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: api.FAQsData) => api.updateFAQs(body),
        onSuccess: (data) => {
            toast.success(data.message || "FAQs updated successfully");
            queryClient.invalidateQueries({ queryKey: ["content-management", "faqs"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update FAQs");
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

export function useUpdateSafetyRules() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: api.SafetyRulesRequest) => api.updateSafetyRules(body),
        onSuccess: (data) => {
            toast.success(data.message || "Safety rules updated successfully");
            queryClient.invalidateQueries({ queryKey: ["content-management", "safety-rules"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update safety rules");
        },
    });
}