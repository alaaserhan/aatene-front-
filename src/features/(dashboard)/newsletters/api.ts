// src/features/(dashboard)/newsletters/api.ts
import api from "@/src/lib/axios";

// ============== Types ==============

export interface NewsletterSubscriber {
    id: number;
    uuid: string;
    email: string;
    /**
     * The list endpoint currently returns only id/uuid/email. Name and phone are
     * part of the screen's design and are rendered as soon as the backend starts
     * sending them, so they stay optional here rather than being dropped.
     */
    name?: string | null;
    phone?: string | null;
    created_at?: string | null;
}

export interface NewslettersListResponse {
    status: boolean;
    message: string;
    recordsTotal: number;
    recordsFiltered: number;
    data: NewsletterSubscriber[];
}

export interface GenericResponse {
    status: boolean;
    message: string;
}

export interface NewslettersParams {
    /** Free-text term; the backend matches it against the subscriber's e-mail. */
    search?: string;
    page?: number;
    per_page?: number;
}

export interface SendNewsletterPayload {
    subject: string;
    /** HTML body produced by the rich-text editor. */
    content: string;
    /** Omitted by the API contract means "every subscriber", so never send []. */
    ids?: number[];
}

// ============== API Functions ==============

export const getNewsletters = async (
    params?: NewslettersParams
): Promise<NewslettersListResponse> => {
    const queryParams = new URLSearchParams();

    // The backend exposes the term as `email` — it has no generic `search` filter.
    if (params?.search) queryParams.append("email", params.search);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));

    const { data } = await api.get<NewslettersListResponse>(
        `/admin/newsletters?${queryParams.toString()}`
    );
    return data;
};

export const sendNewsletterEmail = async (
    payload: SendNewsletterPayload
): Promise<GenericResponse> => {
    const { data } = await api.post<GenericResponse>(
        "/admin/newsletters/send-email",
        payload
    );
    return data;
};

export const deleteNewsletter = async (id: number): Promise<GenericResponse> => {
    const { data } = await api.delete<GenericResponse>(`/admin/newsletters/${id}`);
    return data;
};

export interface BulkDeleteResult {
    deletedIds: number[];
    failedIds: number[];
}

/**
 * The API deletes one subscriber per call, so a bulk delete fans out. Failures
 * are collected instead of aborting: a half-succeeded batch still has to report
 * which rows survived so the admin can retry just those.
 */
export const deleteNewsletters = async (ids: number[]): Promise<BulkDeleteResult> => {
    const results = await Promise.allSettled(
        // `silent` keeps the axios interceptor from firing one toast per failed row.
        ids.map((id) => api.delete<GenericResponse>(`/admin/newsletters/${id}`, { silent: true }))
    );

    const deletedIds: number[] = [];
    const failedIds: number[] = [];

    results.forEach((result, index) => {
        if (result.status === "fulfilled") deletedIds.push(ids[index]);
        else failedIds.push(ids[index]);
    });

    return { deletedIds, failedIds };
};

/**
 * Walks every page so the export covers the whole list rather than the page on
 * screen. The backend pins its own page size, so the loop follows what it
 * actually returns instead of assuming `per_page` was honoured.
 */
export const getAllNewsletters = async (
    params?: Pick<NewslettersParams, "search">
): Promise<NewsletterSubscriber[]> => {
    const MAX_PAGES = 100;
    const all: NewsletterSubscriber[] = [];
    let total = 0;

    for (let page = 1; page <= MAX_PAGES; page++) {
        const response = await getNewsletters({ ...params, page, per_page: 100 });
        const batch = response.data ?? [];

        all.push(...batch);
        total = response.recordsFiltered ?? response.recordsTotal ?? all.length;

        if (batch.length === 0 || all.length >= total) break;
    }

    return all;
};
