//src/features/(dashboard)/requested-services/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

// --- Keys ---
export const REQUESTED_SERVICES_QUERY_KEY = "requested-services";

// --- Hooks ---

export function useGetRequestedServices(
  params: URLSearchParams,
  storeId?: number | string
) {
  return useQuery({
    queryKey: [REQUESTED_SERVICES_QUERY_KEY, params.toString(), storeId],
    queryFn: () => api.getRequestedServices(params, storeId),
  });
}

export function useGetSingleRequestedService(
  id: number | string,
  storeId?: number | string
) {
  return useQuery({
    queryKey: [REQUESTED_SERVICES_QUERY_KEY, id, storeId],
    queryFn: () => api.getSingleRequestedService(id, storeId),
    enabled: !!id,
  });
}

export function useCreateRequestedService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createRequestedService,
    onSuccess: () => {
      toast.success("تم إنشاء طلب الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: [REQUESTED_SERVICES_QUERY_KEY] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
    },
  });
}

export function useUpdateRequestedService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateRequestedService,
    onSuccess: (data) => {
      toast.success("تم تعديل طلب الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: [REQUESTED_SERVICES_QUERY_KEY] });
      // تحديث الكاش للخدمة المفردة إذا لزم الأمر
      // queryClient.setQueryData([REQUESTED_SERVICES_QUERY_KEY, data.data.id], data);
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
    },
  });
}

export function useDeleteRequestedService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteRequestedService,
    onSuccess: () => {
      toast.success("تم حذف طلب الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: [REQUESTED_SERVICES_QUERY_KEY] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });
}

export function useUpdateRequestedServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateRequestedServiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REQUESTED_SERVICES_QUERY_KEY] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الحالة");
    },
  });
}