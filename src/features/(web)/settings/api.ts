import api from "@/src/lib/axios";

// --- Types & Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

// 1. Cities
export interface City {
    id: number;
    name: string;
    is_active: boolean;
}

export interface GetCitiesResponse extends BaseResponse {
    cities: City[];
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
    first_name: string;
    last_name: string;
    fullname: string;
    gender: string;
    date_of_birth: string | null;
    bio: string | null;
    city: City | null;
    district: any | null;
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

// --- API Functions ---

// 1. Cities
export const getCities = async (): Promise<GetCitiesResponse> => {
    const { data } = await api.get<GetCitiesResponse>("/cities");
    return data;
};

export const getCity = async (id: number | string): Promise<any> => { // Response type generic for error as per example
    try {
        const { data } = await api.get(`/cities/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
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

export const getStory = async (id: number | string): Promise<any> => {
    const { data } = await api.get(`/profile/stories/${id}`);
    return data;
};

export const createStory = async (payload: CreateStoryPayload): Promise<any> => {
    const { data } = await api.post("/profile/stories", payload);
    return data;
};

export const updateStory = async (id: number | string, payload: CreateStoryPayload): Promise<any> => {
    // Note: User prompt mentions "Should use PUT method" for update, but example says "Method: POST" then "Response: 405... Should use PUT".
    // I will assume PUT is the correct method to implement.
    const { data } = await api.put(`/profile/stories/${id}`, payload);
    return data;
};

export const deleteStory = async (id: number | string): Promise<any> => {
    const { data } = await api.delete(`/profile/stories/${id}`);
    return data;
};

// 4. Highlights
export const getHighlights = async (): Promise<GetHighlightsResponse> => {
    const { data } = await api.get<GetHighlightsResponse>("/profile/highlights");
    return data;
};

export const getHighlight = async (id: number | string): Promise<any> => {
    const { data } = await api.get(`/profile/highlights/${id}`);
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

export const updateAvatar = async (avatar: File): Promise<any> => {
    const formData = new FormData();
    formData.append("avatar", avatar);
    // Use POST as typically usually used for file uploads, prompt says POST.
    const { data } = await api.post("/auth/account/update_avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
