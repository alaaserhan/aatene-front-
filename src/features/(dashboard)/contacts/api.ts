// src/features/(dashboard)/contacts/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

// ============== Types ==============

export type ContactStatus = "new" | "read" | "replied" | "closed";

export interface ContactUser {
    id: number;
    name: string;
    email: string;
}

export interface Contact {
    id: number;
    uuid: string;
    user: ContactUser | null;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    status: ContactStatus;
    created_at: string;
    updated_at: string;
}

export interface ContactsListResponse {
    status: boolean;
    message: string;
    recordsTotal: number;
    recordsFiltered: number;
    data: Contact[];
}

export interface GenericResponse {
    status: boolean;
    message: string;
    record?: Contact;
}

export interface ContactsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: ContactStatus | "";
}

// ============== API Functions ==============

export const getContacts = async (params?: ContactsParams): Promise<ContactsListResponse> => {
    const endpoint = getDynamicEndpoint("/contacts");
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const { data } = await api.get<ContactsListResponse>(`${endpoint}?${queryParams.toString()}`);
    return data;
};

export const updateContactStatus = async (
    uuid: string,
    status: ContactStatus
): Promise<GenericResponse> => {
    const endpoint = getDynamicEndpoint(`/contacts/${uuid}/update-status`);
    const { data } = await api.post<GenericResponse>(endpoint, { status });
    return data;
};

export const deleteContact = async (id: number): Promise<GenericResponse> => {
    const endpoint = getDynamicEndpoint(`/contacts/${id}`);
    const { data } = await api.delete<GenericResponse>(endpoint);
    return data;
};
