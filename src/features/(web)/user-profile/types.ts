
export interface UserProfile {
    id: number;
    slug: string;
    fullname: string;
    avatar: string;
    avatar_url: string;
    cover: string | null;
    cover_url: string | null;
    email: string;
    phone: string;
    is_active: string;
    gender: string;
    referral_code: string | null;
    last_login_at: string;
    favs_count: string | number;
    followers_count: string | number;
    followings_count: string | number;
    review_rate: string;
    review_count: string;
    bio: string;
    date_of_birth: string;
    user_type: string;
    is_following?: boolean;
    city?: {
        name: string;
    };
}

export interface UserStory {
    id: number;
    image: string | null;
    text: string | null;
    color: string | null;
    created_at: string;
}

export interface UserFollower {
    id: number;
    follower_type: string;
    follower: Omit<UserProfile, "is_following">;
}

export interface UserProfilePageData {
    stories: UserStory[];
    highlights: {
        id: number;
        name: string;
        stories: UserStory[];
    }[];
    followers: UserFollower[];
    sections: {
        id: number;
        name: string;
        slug: string | null;
        description: string | null;
        image: string | null;
        parent_id: number | null;
        products_count: string;
        store_id: string | null;
    }[];
}

export interface UserReview {
    id: number;
    content: string;
    parent_id: number | null;
    rate: string;
    images: string[];
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    has_replies: boolean;
    replies_count: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface UserReviewsResponse {
    status: boolean;
    message: string;
    total: number;
    reviews: UserReview[];
    avg_rate: string;
    rate_stats: {
        "1": number;
        "2": number;
        "3": string | number;
        "4": number;
        "5": number;
    };
}
