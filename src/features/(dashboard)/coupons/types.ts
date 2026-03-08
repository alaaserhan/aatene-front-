export interface CouponSection {
    id: number;
    name: string;
    slug?: string;
    image?: string | null;
}

export interface CouponProduct {
    id: number;
    name: string;
    slug?: string;
    cover?: string | null;
    price?: string;
}

export interface Coupon {
    id: number;
    code: string;
    type: "value" | "percentage" | string;
    value: string;
    start_date: string;
    end_date: string;
    status: "active" | "not-active" | string;
    sections?: (number | CouponSection)[];
    products?: (number | CouponProduct)[];
    store_id?: string | number;
}


export interface CouponPayload {
    code: string;
    type: "value" | "percentage" | string;
    value: string;
    start_date: string;
    end_date: string;
    status: "active" | "not-active" | string;
    sections: number[];
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
    record: Coupon;
}


export interface CreateCouponResponse {
    status: boolean;
    message: string;
    record: Coupon;
}
