"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getCities,
    getCity,
    getBlockedUsers,
    blockUser,
    unblockUser,
    getStories,
    getStory,
    createStory,
    updateStory,
    deleteStory,
    getHighlights,
    getHighlight,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    getAccount,
    updateAvatar,
    updateAccount,
    updateEmail,
    updatePhone,
    updatePassword,
    getDeviceNotificationSettings,
    updateDevicePreferences,
    convertToMerchant,
    BlockUserPayload,
    UnblockUserPayload,
    CreateStoryPayload,
    CreateHighlightPayload,
    UpdateAccountPayload,
    UpdatePasswordPayload,
    UpdateDevicePreferencesPayload,
} from "./api";

const QK = {
    cities: {
        all: ["cities"] as const,
        single: (id: string | number) => ["cities", String(id)] as const,
    },
    blocks: {
        list: (type: string) => ["blocked-users", type] as const,
    },
    stories: {
        all: ["stories"] as const,
        single: (id: string | number) => ["stories", String(id)] as const,
    },
    highlights: {
        all: ["highlights"] as const,
        single: (id: string | number) => ["highlights", String(id)] as const,
    },
    account: {
        profile: ["account-profile"] as const,
        device: ["device-settings"] as const,
    },
};

// --- Cities ---
export const useGetCities = () => {
    return useQuery({
        queryKey: QK.cities.all,
        queryFn: getCities,
    });
};

export const useGetCity = (id: string | number) => {
    return useQuery({
        queryKey: QK.cities.single(id),
        queryFn: () => getCity(id),
        enabled: !!id,
    });
};

// --- Blocking ---
export const useGetBlockedUsers = (type: "store" | "user") => {
    return useQuery({
        queryKey: QK.blocks.list(type),
        queryFn: () => getBlockedUsers(type),
        enabled: !!type,
    });
};

export const useBlockUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: BlockUserPayload) => blockUser(payload),
        onSuccess: (data) => {
            toast.success(data.message || "User blocked successfully");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.blocks.list(variables.blocked_type) });
        },
    });
};

export const useUnblockUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UnblockUserPayload) => unblockUser(payload),
        onSuccess: (data) => {
            toast.success(data.message || "User unblocked successfully");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.blocks.list(variables.blocked_type) });
        },
    });
};

// --- Stories ---
export const useGetStories = () => {
    return useQuery({
        queryKey: QK.stories.all,
        queryFn: getStories,
    });
};

export const useGetStory = (id: string | number) => {
    return useQuery({
        queryKey: QK.stories.single(id),
        queryFn: () => getStory(id),
        enabled: !!id,
    });
};

export const useCreateStory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateStoryPayload) => createStory(payload),
        onSuccess: () => { // Response structure might vary based on method, just toast success
            toast.success("Story created successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.stories.all });
            qc.invalidateQueries({ queryKey: QK.highlights.all }); // Stories might affect highlights? Maybe not directly but good practice if linked
        },
    });
};

export const useUpdateStory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string | number; payload: CreateStoryPayload }) =>
            updateStory(variables.id, variables.payload),
        onSuccess: () => {
            toast.success("Story updated successfully");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.stories.all });
            qc.invalidateQueries({ queryKey: QK.stories.single(variables.id) });
        },
    });
};

export const useDeleteStory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteStory(id),
        onSuccess: () => {
            toast.success("Story deleted successfully");
        },
        onSettled: (_data, _error, id) => {
            qc.invalidateQueries({ queryKey: QK.stories.all });
            qc.invalidateQueries({ queryKey: QK.stories.single(id) });
        },
    });
};

// --- Highlights ---
export const useGetHighlights = () => {
    return useQuery({
        queryKey: QK.highlights.all,
        queryFn: getHighlights,
    });
};

export const useGetHighlight = (id: string | number) => {
    return useQuery({
        queryKey: QK.highlights.single(id),
        queryFn: () => getHighlight(id),
        enabled: !!id,
    });
};

export const useCreateHighlight = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateHighlightPayload) => createHighlight(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Highlight created successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.highlights.all });
        },
    });
};

export const useUpdateHighlight = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string | number; payload: CreateHighlightPayload }) =>
            updateHighlight(variables.id, variables.payload),
        onSuccess: (data) => {
            toast.success(data.message || "Highlight updated successfully");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.highlights.all });
            qc.invalidateQueries({ queryKey: QK.highlights.single(variables.id) });
        },
    });
};

export const useDeleteHighlight = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteHighlight(id),
        onSuccess: (data) => {
            toast.success(data.message || "Highlight deleted successfully");
        },
        onSettled: (_data, _error, id) => {
            qc.invalidateQueries({ queryKey: QK.highlights.all });
            qc.invalidateQueries({ queryKey: QK.highlights.single(id) });
        },
    });
};

// --- Account ---
export const useGetAccount = () => {
    return useQuery({
        queryKey: QK.account.profile,
        queryFn: getAccount,
    });
};

export const useUpdateAvatar = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (avatar: File) => updateAvatar(avatar),
        onSuccess: () => {
            toast.success("Avatar updated successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};

export const useUpdateAccount = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateAccountPayload) => updateAccount(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Account updated successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};

export const useUpdateEmail = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (email: string) => updateEmail(email),
        onSuccess: (data) => {
            toast.success(data.message || "Email updated successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};

export const useUpdatePhone = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (phone: string) => updatePhone(phone),
        onSuccess: (data) => { // BaseResponse
            toast.success(data.message || "Phone updated successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (payload: UpdatePasswordPayload) => updatePassword(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Password updated successfully");
        },
    });
};

export const useGetDeviceNotificationSettings = () => {
    return useQuery({
        queryKey: QK.account.device,
        queryFn: getDeviceNotificationSettings,
    });
};

export const useUpdateDevicePreferences = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateDevicePreferencesPayload) => updateDevicePreferences(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Device preferences updated successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.device });
        },
    });
};

export const useConvertToMerchant = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: convertToMerchant,
        onSuccess: () => {
            toast.success("Account converted to merchant successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};
