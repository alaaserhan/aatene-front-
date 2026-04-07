// src/features/(dashboard)/contacts/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useGetContacts(params?: api.ContactsParams) {
    return useQuery({
        queryKey: ["contacts", params?.page, params?.per_page, params?.search, params?.status],
        queryFn: () => api.getContacts(params),
        placeholderData: (previousData) => previousData,
    });
}

export function useUpdateContactStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, status }: { uuid: string; status: api.ContactStatus }) =>
            api.updateContactStatus(uuid, status),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث حالة الرسالة");
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل تحديث الحالة");
        },
    });
}

export function useDeleteContact() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteContact,
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف الرسالة");
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل حذف الرسالة");
        },
    });
}
