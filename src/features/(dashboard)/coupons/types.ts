export interface Coupon {
    id: number;
    code: string;
    type: "value" | "percentage" | string;
    value: string;
    start_date: string;
    end_date: string;
    status: "active" | "not-active" | string;
    categories?: number[];
    products?: number[];
    store_id?: string | number;
}

export interface CouponPayload {
    code: string;
    type: "value" | "percentage" | string;
    value: string;
    start_date: string;
    end_date: string;
    status: "active" | "not-active" | string;
    categories: number[];
    products: number[];
    store_id?: number;
}

export interface CouponResponse {
    status: boolean;
    message: string;
    recordsTotal: number;
    recordsFiltered: number;
    data: Coupon[];
}

export interface SingleCouponResponse {
    status: boolean;
    message: string;
    data: Coupon;
}

export interface CreateCouponResponse {
    status: boolean;
    message: string;
    data: Coupon;
}
