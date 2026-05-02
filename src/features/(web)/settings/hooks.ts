"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/src/stores/auth-store";
import {
    getCities,
    GetCitiesParams,
    getCity,
    getDistricts,
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
    updateCover,
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
    FollowPayload,
    UnfollowPayload,
    followUserOrStore,
    unfollowUserOrStore,
    removeFollower,
    getFollowers,
    getFollowings,
    getFollowersCount,
    RemoveFollowerPayload,
} from "./api";

const QK = {
    cities: {
        all: ["cities"] as const,
        single: (id: string | number) => ["cities", String(id)] as const,
    },
    districts: {
        all: ["districts"] as const,
        byCity: (cityId: string | number) => ["districts", String(cityId)] as const,
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
    follows: {
        followers: (name?: string) => ["followers", name] as const,
        followings: (name?: string) => ["followings", name] as const,
        count: ["followers-count"] as const,
    },
};

// --- Cities ---
export const useGetCities = (params?: GetCitiesParams) => {
    return useQuery({
        queryKey: [...QK.cities.all, params?.name, params?.page, params?.per_page],
        queryFn: () => getCities(params),
    });
};

export const useGetCity = (id: string | number) => {
    return useQuery({
        queryKey: QK.cities.single(id),
        queryFn: () => getCity(id),
        enabled: !!id,
    });
};

export const useGetDistricts = (cityId?: string | number) => {
    return useQuery({
        queryKey: QK.districts.byCity(cityId || "all"),
        queryFn: () => getDistricts(cityId),
        enabled: !!cityId,
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
            qc.invalidateQueries({ queryKey: ["conversations"] });
            qc.invalidateQueries({ queryKey: ["conversation-messages"] });
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
            qc.invalidateQueries({ queryKey: ["conversations"] });
            qc.invalidateQueries({ queryKey: ["conversation-messages"] });
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
        onSuccess: (data) => {
            toast.success(data.message || "Story created successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.stories.all });
            qc.invalidateQueries({ queryKey: QK.highlights.all });
        },
    });
};

export const useUpdateStory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string | number; payload: CreateStoryPayload }) =>
            updateStory(variables.id, variables.payload),
        onSuccess: (data) => {
            toast.success(data.message || "Story updated successfully");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.stories.all });
            qc.invalidateQueries({ queryKey: QK.stories.single(variables.id) });
            qc.invalidateQueries({ queryKey: QK.highlights.all });
        },
    });
};

export const useDeleteStory = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => deleteStory(id),
        onSuccess: (data) => {
            toast.success(data.message || "Story deleted successfully");
        },
        onSettled: (_data, _error, id) => {
            qc.invalidateQueries({ queryKey: QK.stories.all });
            qc.invalidateQueries({ queryKey: QK.stories.single(id) });
            qc.invalidateQueries({ queryKey: QK.highlights.all });
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
        queryFn: async () => {
            const data = await getAccount();
            if (data?.user) {
                useAuthStore.getState().updateUser(data.user);
            }
            return data;
        },
    });
};

export const useUpdateAvatar = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (avatar: File) => updateAvatar(avatar),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث الصورة");
            
            // الباكند يُرجع avatar_url في root مباشرة: { status, message, avatar_url }
            const newAvatarUrl = data?.avatar_url || data?.data?.avatar_url || data?.data?.avatar;
            if (newAvatarUrl) {
                useAuthStore.getState().updateUser({ 
                    avatar_url: newAvatarUrl,
                    avatar: newAvatarUrl,
                });
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};

export const useUpdateCover = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (cover: File) => updateCover(cover),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث صورة الغلاف");
            // الباك: returnData(['cover_url' => ...]) → { status, message, cover_url } في الجذر
            const newCoverUrl = data?.cover_url ?? data?.data?.cover_url;
            if (newCoverUrl) {
                useAuthStore.getState().updateUser({ cover: newCoverUrl, cover_url: newCoverUrl });
            }
        },
        onError: () => {
            toast.error("حدث خطأ أثناء تحديث صورة الغلاف");
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
        onSuccess: (data, variables) => {
            toast.success(data.message || "Account updated successfully");
            // Update auth store with the new data
            useAuthStore.getState().updateUser({
                first_name: variables.first_name,
                last_name: variables.last_name,
                // fullname might need to be constructed if the store uses it
                fullname: `${variables.first_name} ${variables.last_name}`,
            });
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
        onSuccess: (data, variables) => {
            toast.success(data.message || "Email updated successfully");
            useAuthStore.getState().updateUser({ email: variables });
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
        onSuccess: (data, variables) => { // BaseResponse
            toast.success(data.message || "Phone updated successfully");
            useAuthStore.getState().updateUser({ phone: variables });
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
        onSuccess: (data) => {
            toast.success(data.message || "Account converted to merchant successfully");
            useAuthStore.getState().updateUser({ user_type: "merchant" });
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};

// --- Followings ---
export const useFollowUserOrStore = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: FollowPayload) => followUserOrStore(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Followed successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.follows.followings() });
            qc.invalidateQueries({ queryKey: QK.account.profile });
            qc.invalidateQueries({ queryKey: ["userProfile"] });
            qc.invalidateQueries({ queryKey: ["storeProfile"] });
            qc.invalidateQueries({ queryKey: ["storePageData"] });
            qc.invalidateQueries({ queryKey: ["stores"] });
            qc.invalidateQueries({ queryKey: ["storeWhoFavorited"] });
        },
    });
};

export const useUnfollowUserOrStore = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UnfollowPayload) => unfollowUserOrStore(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Unfollowed successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.follows.followings() });
            qc.invalidateQueries({ queryKey: QK.account.profile });
            qc.invalidateQueries({ queryKey: ["userProfile"] });
            qc.invalidateQueries({ queryKey: ["storeProfile"] });
            qc.invalidateQueries({ queryKey: ["storePageData"] });
            qc.invalidateQueries({ queryKey: ["stores"] });
            qc.invalidateQueries({ queryKey: ["storeWhoFavorited"] });
        },
    });
};

export const useRemoveFollower = () => {
    const qc = useQueryClient();
    // Assuming body is not critical or is passed as is
    return useMutation({
        mutationFn: (payload: RemoveFollowerPayload) => removeFollower(payload),
        onSuccess: (data) => {
            // data.followers_count is returned
            toast.success(data.message || "Follower removed successfully");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.follows.followers() });
            qc.invalidateQueries({ queryKey: QK.follows.count });
            qc.invalidateQueries({ queryKey: QK.account.profile });
        },
    });
};

export const useGetFollowers = (name?: string) => {
    return useQuery({
        queryKey: QK.follows.followers(name),
        queryFn: () => getFollowers(name),
    });
};

export const useGetFollowings = (name?: string) => {
    return useQuery({
        queryKey: QK.follows.followings(name),
        queryFn: () => getFollowings(name),
    });
};

export const useGetFollowersCount = () => {
    return useQuery({
        queryKey: QK.follows.count,
        queryFn: getFollowersCount,
    });
};
