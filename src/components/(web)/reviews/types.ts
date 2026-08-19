export interface SharedReviewUser {
    name: string;
    slug?: string;
    avatar: string | null;
}

export interface SharedReview {
    id: number;
    content: string;
    rate: string | null;
    images: string[];
    user: SharedReviewUser;
    created_at: string;
    parent_id?: number | string | null;
    has_replies?: boolean;
    replies_count?: string | number | null;
}

/** Payload handed to the consumer when a review (or a reply) is submitted. */
export interface ReviewSubmitPayload {
    content: string;
    rate: number;
    images: File[];
    parent_id?: number | null;
}
