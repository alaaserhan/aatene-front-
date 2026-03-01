"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/src/hooks/use-api-query";
import {
    getCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    updateCouponStatus
} from "./api";
import { CouponPayload } from "./types";
import { AxiosError } from "axios";

export const useGetCoupons = (params?: URLSearchParams) => {
    return useApiQuery({
        queryKey: ["coupons", params?.toString()],
        queryFn: () => getCoupons(params),
    });
};


export const useGetCoupon = (id: number) => {
    return useApiQuery({
        queryKey: ["coupon", id],
        queryFn: () => getCoupon(id),
        enabled: !!id,
    });
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CouponPayload) => createCoupon(payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم إنشاء الكوبون بنجاح");
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء الكوبون");
        },
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: CouponPayload }) => updateCoupon(id, payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث الكوبون بنجاح");
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            queryClient.invalidateQueries({ queryKey: ["coupon", data.record.id] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الكوبون");
        },
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteCoupon(id),
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف الكوبون بنجاح");
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الكوبون");
        },
    });
};

export const useUpdateCouponStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: "active" | "not-active" }) => updateCouponStatus(id, status),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث حالة الكوبون بنجاح");
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الحالة");
        },
    });
};
