
import api from "@/src/lib/axios";
import { BaseResponse } from "../fav/api";

// --- Types ---

// Using types similar to what we've seen in other features, but specific to comparison
export interface ServiceCompareItem {
    id: number;
    slug: string;
    title: string;
    description: string;
    images: string[];
    images_urls: string[];
    image: string | null;
    image_url: string | null;
    is_favorite: boolean;
    price: string;
    execute_type: string;
    execute_count: string;
    review_rate: string;
    review_count: string;
    status: string;
}

export interface ProductCompareItem {
    id: number;
    slug: string | null;
    name: string;
    description: string;
    short_description: string | null;
    cover: string | null;
    shown: boolean;
    is_favorite: boolean;
    in_compare: boolean;
    price: string;
    price_after_discount: string;
    discount_present: number;
    review_rate: string | null;
    review_count: string | null;
}

export interface AddServiceToCompareResponse extends BaseResponse {
    compare: ServiceCompareItem;
}

export interface GetServiceCompareListResponse extends BaseResponse {
    services: ServiceCompareItem[];
    total: number;
}

export interface GetServiceCompareCountResponse extends BaseResponse {
    compare_count: number;
}

export interface AddProductToCompareResponse extends BaseResponse {
    compare: ProductCompareItem;
}

export interface GetProductCompareListResponse extends BaseResponse {
    compares: ProductCompareItem[];
    total: number;
}

export interface GetProductCompareCountResponse extends BaseResponse {
    compare_count: number;
}

// --- Services Endpoints ---

// 1. Add Service to Compare
export const addServiceToCompare = async (serviceId: number): Promise<AddServiceToCompareResponse> => {
    const { data } = await api.post<AddServiceToCompareResponse>("/compares/services/add", { service_id: serviceId });
    return data;
};

// 2. Remove Service from Compare
export const removeServiceFromCompare = async (serviceId: number): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/compares/services/remove", { service_id: serviceId });
    return data;
};

// 3. Get Service Compare List
export const getServiceCompareList = async (): Promise<GetServiceCompareListResponse> => {
    const { data } = await api.get<GetServiceCompareListResponse>("/compares/services");
    return data;
};

// 4. Clear Service Compare List
export const clearServiceCompareList = async (): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/compares/services/clear");
    return data;
};

// 5. Check if Service is in Compare List
export const checkServiceInCompare = async (serviceId: number): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/compares/services/check", { service_id: serviceId });
    return data;
};

// 6. Get Service Compare Count
export const getServiceCompareCount = async (): Promise<GetServiceCompareCountResponse> => {
    const { data } = await api.get<GetServiceCompareCountResponse>("/compares/services/count");
    return data;
};

// --- Products Endpoints ---

// 7. Add Product to Compare
export const addProductToCompare = async (productId: number): Promise<AddProductToCompareResponse> => {
    const { data } = await api.post<AddProductToCompareResponse>("/compares/products/add", { product_id: productId });
    return data;
};

// 8. Remove Product from Compare
export const removeProductFromCompare = async (productId: number): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/compares/products/remove", { product_id: productId });
    return data;
};

// 9. Get Product Compare List
export const getProductCompareList = async (): Promise<GetProductCompareListResponse> => {
    const { data } = await api.get<GetProductCompareListResponse>("/compares/products");
    return data;
};

// 10. Clear Product Compare List
export const clearProductCompareList = async (): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/compares/products/clear");
    return data;
};

// 11. Check if Product is in Compare List
export const checkProductInCompare = async (productId: number): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/compares/products/check", { product_id: productId });
    return data;
};

// 12. Get Product Compare Count
export const getProductCompareCount = async (): Promise<GetProductCompareCountResponse> => {
    const { data } = await api.get<GetProductCompareCountResponse>("/compares/products/count");
    return data;
};
