import api from "@/src/lib/axios";

// --- Types & Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

// 0. Global Settings
export interface PolicyTerm {
    logo: string | null;
    title: Record<string, string>;
    content: Record<string, string>;
    logo_url: string | null;
}

export interface GlobalSettingsData {
    name: string;
    about_website: string;
    logo: string | null;
    logo_url: string | null;
    main_color: string | null;
    email: string | null;
    address: string | null;
    languages: string[];
    whatsapp: string | null;
    phone: string | null;
    facebook: string | null;
    instagram: string | null;
    snapchat: string | null;
    tiktok: string | null;
    x: string | null;
    youtube: string | null;
    policies?: PolicyTerm[];
    terms?: PolicyTerm[];
}

export interface GetGlobalSettingsResponse extends BaseResponse {
    settings: GlobalSettingsData;
}


// 1. Cities
export interface City {
    id: number;
    name: string;
    is_active: boolean;
}

export interface GetCitiesResponse extends BaseResponse {
    cities: City[];
    recordsTotal?: number;
    recordsFiltered?: number;
    total?: number;
}

export interface GetCitiesParams {
    name?: string;
    page?: number;
    per_page?: number;
}

// 1.1 Districts
export interface District {
    id: number;
    name: string;
    city_id: string; // From JSON it looks like string "2"
}

export interface GetDistrictsResponse extends BaseResponse {
    districts: District[];
}

// 2. Blocked Users
export interface BlockedParticipant {
    id: number;
    conversation_id: null | number;
    participant_data: {
        id: string;
        name: string | null;
        slug: string | null;
        avatar: string | null;
        followers_count: number;
        type: string; // "store" | "user"
    };
    created_at: string;
    updated_at: string;
}

export interface GetBlockedUsersResponse extends BaseResponse {
    participants: BlockedParticipant[];
}

export interface BlockUserPayload {
    blocked_type: "store" | "user";
    blocked_id: number | string;
    reason?: string;
}

export interface BlockUserResponse extends BaseResponse {
    block: {
        id: number;
        blocker_type: string;
        blocker_id: string;
        blocked_type: string;
        blocked_id: string;
        reason: string | null;
        creator_id: string;
        updated_at: string;
        created_at: string;
    };
}

export interface UnblockUserPayload {
    blocked_type: "store" | "user";
    blocked_id: number | string;
}

// 3. Stories
export interface Story {
    id: number;
    image: string | null;
    text: string | null;
    color: string | null;
    created_at: string;
}

export interface GetStoriesResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    data: Story[];
}

export interface CreateStoryPayload {
    image?: string | null;
    text?: string | null;
    color?: string | null;
    image_file?: File;
}

// 4. Highlights
export interface Highlight {
    id: number;
    name: string;
    stories: Story[];
}

export interface GetHighlightsResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    data: Highlight[];
}

export interface CreateHighlightPayload {
    name: string;
    stories: number[]; // IDs of stories
}

export interface HighlightResponse extends BaseResponse {
    record: Highlight;
}

// 5. Account
export interface User {
    id: number;
    avatar: string | null;
    avatar_url?: string | null;
    /** ProfileResource يعيد الغلاف تحت المفتاح `cover` (رابط كامل) */
    cover?: string | null;
    cover_url?: string | null;
    first_name: string;
    last_name: string;
    fullname: string;
    gender: string;
    date_of_birth: string | null;
    bio: string | null;
    city: City | null;
    district: District | null;
    user_type: string;
    email: string;
    phone: string;
    followers_count: string;
    followings_count: string;
}

export interface AccountResponse extends BaseResponse {
    user: User;
}

export interface UpdateAccountPayload {
    first_name: string;
    last_name: string;
    gender: string;
    date_of_birth?: string;
    bio?: string;
    city_id?: number;
    district_id?: number;
}

export interface UpdatePasswordPayload {
    password: string;
    password_confirmation: string;
}

export interface DeviceSettings {
    id: number;
    notification_status: boolean;
    device_token: string;
    notify_activity: boolean;
    notify_platform_trends: boolean;
    notify_messages: boolean;
    notify_following: boolean;
    notify_recommendations: boolean;
    device_name: string;
}

export interface DeviceSettingsResponse extends BaseResponse {
    device: DeviceSettings;
}

export interface UpdateDevicePreferencesPayload {
    notify_activity?: boolean;
    notify_platform_trends?: boolean;
    notify_messages?: boolean;
    notify_following?: boolean;
    notify_recommendations?: boolean;
}

// 6. Followings
export interface FollowPayload {
    followed_type: "user" | "store" | "product";
    followed_id: number;
}

export interface FollowResponse extends BaseResponse {
    following: {
        id: number;
        followed_type: string;
        followed: FollowableEntity;
    };
}

export interface FollowableEntity {
    id: number | string;
    name?: string | null;
    fullname?: string | null;
    avatar_url?: string | null;
    logo_url?: string | null;
    slug?: string | null;
    followers_count?: number | string;
}

export interface FollowingItem {
    id: number;
    followed_type: string;
    followed: FollowableEntity;
}

export interface FollowerItem {
    id: number;
    follower_type: string;
    follower?: FollowableEntity;
    user?: FollowableEntity;
}

export interface UnfollowPayload {
    followed_type: "store" | "user" | "product"; // Assuming product is possible
    followed_id: number;
}

export interface UnfollowResponse extends BaseResponse {
    errors: string[];
}

export interface RemoveFollowerResponse extends BaseResponse {
    followers_count: number;
}

export interface FollowersResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    data: FollowerItem[];
}

export interface FollowingsResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    data: FollowingItem[];
}

// --- API Functions ---

// 0. Global Settings
export const getGlobalSettings = async (): Promise<GetGlobalSettingsResponse> => {
    const { data } = await api.get<GetGlobalSettingsResponse>("/settings");
    return data;
};

// 1. Cities
export const getCities = async (params?: GetCitiesParams): Promise<GetCitiesResponse> => {
    const { data } = await api.get<GetCitiesResponse>("/cities", { params });
    return data;
};

export const getCity = async (id: number | string): Promise<BaseResponse & { city: City }> => {
    try {
        const { data } = await api.get<BaseResponse & { city: City }>(`/cities/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getDistricts = async (city_id?: number | string): Promise<GetDistrictsResponse> => {
    // Screenshot shows /districts with query params if any
    const url = city_id ? `/districts?city_id=${city_id}` : "/districts";
    const { data } = await api.get<GetDistrictsResponse>(url);
    return data;
};

// 2. Blocking
export const getBlockedUsers = async (type: "store" | "user"): Promise<GetBlockedUsersResponse> => {
    const { data } = await api.get<GetBlockedUsersResponse>(`/blocks/blocked-users?type=${type}`);
    return data;
};

export const blockUser = async (payload: BlockUserPayload): Promise<BlockUserResponse> => {
    const { data } = await api.post<BlockUserResponse>("/blocks/block", payload);
    return data;
};

export const unblockUser = async (payload: UnblockUserPayload): Promise<BaseResponse> => {
    // Note: API doc says DELETE for unblock, with body. 
    // Axios delete accepts 'data' in config for body.
    const { data } = await api.delete<BaseResponse>("/blocks/unblock", { data: payload });
    return data;
};

// 3. Stories
export const getStories = async (): Promise<GetStoriesResponse> => {
    const { data } = await api.get<GetStoriesResponse>("/profile/stories");
    return data;
};

export const getStory = async (id: number | string): Promise<BaseResponse & { record: Story }> => {
    const { data } = await api.get<BaseResponse & { record: Story }>(`/profile/stories/${id}`);
    return data;
};

/**
 * يستخرج file_name من URL الصورة الكامل
 * مثال: "https://backend.aatene.com/storage/media/abc.jpg" → "media/abc.jpg"
 * الباك اند يتوقع file_name من جدول media_center وليس URL كامل
 */
const extractFileName = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const storageIndex = url.indexOf("/storage/");
    if (storageIndex !== -1) return url.substring(storageIndex + "/storage/".length);
    // إذا كانت قيمة file_name مباشرة (لا تحتوي على /storage/)
    return url;
};

export const createStory = async (payload: CreateStoryPayload): Promise<BaseResponse & { record: Story }> => {
    if (payload.image_file) {
        const formData = new FormData();
        formData.append("image_file", payload.image_file);

        const { data } = await api.post<BaseResponse & { record: Story }>("/profile/stories", formData, {
            headers: { "Content-Type": undefined }, // اتركه لـ browser يُعيّنه تلقائياً مع boundary
        });
        return data;
    }

    // قصة نصية
    const { data } = await api.post<BaseResponse & { record: Story }>("/profile/stories", {
        text: payload.text || undefined,
        color: payload.color || undefined,
    });
    return data;
};

export const updateStory = async (id: number | string, payload: CreateStoryPayload): Promise<BaseResponse & { record: Story }> => {
    if (payload.image_file) {
        // PHP لا يقرأ $_FILES مع PUT → نستخدم POST + _method=PUT (Laravel method spoofing)
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("image_file", payload.image_file);

        const { data } = await api.post<BaseResponse & { record: Story }>(`/profile/stories/${id}`, formData, {
            headers: { "Content-Type": undefined }, // browser يُعيّن boundary تلقائياً
        });
        return data;
    }

    if (payload.image) {
        // الباك اند يتوقع file_name من جدول media_center وليس URL كامل
        const fileName = extractFileName(payload.image);
        const { data } = await api.put<BaseResponse & { record: Story }>(`/profile/stories/${id}`, {
            image: fileName,
        });
        return data;
    }

    // قصة نصية
    const { data } = await api.put<BaseResponse & { record: Story }>(`/profile/stories/${id}`, {
        text: payload.text || undefined,
        color: payload.color || undefined,
    });
    return data;
};

export const deleteStory = async (id: number | string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(`/profile/stories/${id}`);
    return data;
};

// 4. Highlights
export const getHighlights = async (): Promise<GetHighlightsResponse> => {
    const { data } = await api.get<GetHighlightsResponse>("/profile/highlights");
    return data;
};

export const getHighlight = async (id: number | string): Promise<HighlightResponse> => {
    const { data } = await api.get<HighlightResponse>(`/profile/highlights/${id}`);
    return data;
};

export const createHighlight = async (payload: CreateHighlightPayload): Promise<HighlightResponse> => {
    const { data } = await api.post<HighlightResponse>("/profile/highlights", payload);
    return data;
};

export const updateHighlight = async (id: number | string, payload: CreateHighlightPayload): Promise<HighlightResponse> => {
    const { data } = await api.put<HighlightResponse>(`/profile/highlights/${id}`, payload);
    return data;
};

export const deleteHighlight = async (id: number | string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(`/profile/highlights/${id}`);
    return data;
};

// 5. Account
export const getAccount = async (): Promise<AccountResponse> => {
    const { data } = await api.get<AccountResponse>("/auth/account");
    return data;
};

export const updateAvatar = async (avatar: File): Promise<BaseResponse & { avatar_url?: string; data?: { avatar_url: string; avatar?: string } }> => {
    const formData = new FormData();
    formData.append("avatar", avatar);
    const { data } = await api.post<BaseResponse & { avatar_url?: string; data?: { avatar_url: string; avatar?: string } }>("/auth/account/update_avatar", formData, {
        headers: { "Content-Type": undefined }, // اتركه للمتصفح يُعيّن boundary تلقائياً
    });
    return data;
};

export const updateCover = async (cover: File): Promise<BaseResponse & { cover_url?: string; data?: { cover_url: string } }> => {
    const formData = new FormData();
    formData.append("cover", cover);
    const { data } = await api.post<BaseResponse & { cover_url?: string; data?: { cover_url: string } }>("/auth/account/update_cover", formData, {
        headers: { "Content-Type": undefined }, // اتركه للمتصفح يُعيّن boundary تلقائياً
    });
    return data;
};

export const updateAccount = async (payload: UpdateAccountPayload): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/auth/account/update_account", payload);
    return data;
};

export const updateEmail = async (email: string): Promise<AccountResponse> => {
    // Prompt says Body: form-data (email: ...).
    const { data } = await api.post<AccountResponse>("/auth/account/update_email", { email });
    return data;
};

export const updatePhone = async (phone: string): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/auth/account/update_phone", { phone });
    return data;
};

export const updatePassword = async (payload: UpdatePasswordPayload): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/auth/account/update_password", payload);
    return data;
};

export const getDeviceNotificationSettings = async (): Promise<DeviceSettingsResponse> => {
    const { data } = await api.get<DeviceSettingsResponse>("/auth/account/get_device_notifications_settings");
    return data;
};

export const updateDevicePreferences = async (payload: UpdateDevicePreferencesPayload): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/auth/account/update_device_preferences", payload);
    return data;
};

export const convertToMerchant = async (): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/convert-to-merchant");
    return data;
};

// 6. Followings
export const followUserOrStore = async (payload: FollowPayload): Promise<FollowResponse> => {
    const { data } = await api.post<FollowResponse>("/followings/follow", payload);
    return data;
};

export const unfollowUserOrStore = async (payload: UnfollowPayload): Promise<UnfollowResponse> => {
    const { data } = await api.post<UnfollowResponse>("/followings/unfollow", payload);
    return data;
};

export interface RemoveFollowerPayload {
    follower_id: number | string;
}

export const removeFollower = async (payload: RemoveFollowerPayload): Promise<RemoveFollowerResponse> => {
    // Body "Not specified", assuming empty or some ID
    const { data } = await api.post<RemoveFollowerResponse>("/followers/remove", payload);
    return data;
};

export const getFollowers = async (name?: string): Promise<FollowersResponse> => {
    const { data } = await api.get<FollowersResponse>("/followers", { params: { name } });
    return data;
};

export const getFollowings = async (name?: string): Promise<FollowingsResponse> => {
    const { data } = await api.get<FollowingsResponse>("/followings", { params: { name } });
    return data;
};

export const getFollowersCount = async (): Promise<BaseResponse & { count: number }> => {
    const { data } = await api.get<BaseResponse & { count: number }>("/followers/count");
    return data;
};
