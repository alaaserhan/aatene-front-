import api from "@/src/lib/axios";
import {
    CreateRequestedServicePayload,
    CreateRequestedServiceResponse,
    GetRequestedServicesParams,
    GetRequestedServicesResponse,
    // RequestedService, // Unused
    GetRequestedServiceCommentsResponse,
    AddRequestedServiceCommentResponse,
    GetRequestedServiceBySlugResponse,
} from "./types";

export const getRequestedServices = async (
    params?: GetRequestedServicesParams
) => {
    const { data } = await api.get<GetRequestedServicesResponse>(
        "/requested-services",
        { params }
    );
    return data;
};

export const getMyRequestedServices = async (
    params?: GetRequestedServicesParams
) => {
    const { data } = await api.get<GetRequestedServicesResponse>(
        "/my/requested-services",
        { params }
    );
    return data;
};


export const getRequestedServiceBySlug = async (slugOrId: string | number) => {
    const { data } = await api.get<GetRequestedServiceBySlugResponse>(`/requested-services/${slugOrId}`);
    return data;
};

export const createRequestedService = async (
    payload: CreateRequestedServicePayload
) => {
    const { data } = await api.post<CreateRequestedServiceResponse>(
        "/my/requested-services",
        payload
    );
    return data;
};

export const updateRequestedService = async (
    id: number | string,
    payload: CreateRequestedServicePayload
) => {
    const { data } = await api.put<CreateRequestedServiceResponse>(
        `/my/requested-services/${id}`,
        payload
    );
    return data;
};

export const getRequestedServiceComments = async (slug: string | number) => {
    const { data } = await api.get<GetRequestedServiceCommentsResponse>(
        `/reviews/requested-service/${slug}`
    );
    return data;
};

export const addRequestedServiceComment = async (
    slug: string | number,
    payload: FormData
) => {
    const { data } = await api.post<AddRequestedServiceCommentResponse>(
        `/reviews/requested-service/${slug}`,
        payload
    );
    return data;
};
