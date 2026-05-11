// src/features/(dashboard)/services/hooks.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";


export function useGetServices(params: URLSearchParams, storeId?: number | string) {
  return useQuery({
    queryKey: ["services", params.toString(), storeId],
    queryFn: () => api.getServices(params, storeId),
  });
}

export function useGetService(id: number | string, storeId?: number | string) {
  return useQuery({
    queryKey: ["services", id, storeId],
    queryFn: () => api.getSingleService(id, storeId),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
    },
  });
}

// src/features/(dashboard)/services/hooks.ts

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      storeId
    }: {
      id: number | string;
      payload: api.ServicePayload;
      storeId?: number | string;
    }) => api.updateService(id, payload, storeId),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });

      queryClient.setQueryData(["services", variables.id, variables.storeId], data);
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storeId }: { id: number | string; storeId?: number | string }) =>
      api.deleteService(id, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
    },
  });
}

export function useUpdateServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      storeId
    }: {
      id: number | string;
      payload: api.ServiceStatusPayload;
      storeId?: number | string;
    }) => api.updateServiceStatus(id, payload, storeId),
    // ✅ تم إزالة onMutate لمنع الأخطاء الناتجة عن اختلاف هيكل البيانات
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      console.error("Update Status Error:", error);
    },
  });
}

export function useUpdateServiceShown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      shown,
      storeId
    }: {
      id: number | string;
      shown: number | boolean;
      storeId?: number | string;
    }) => api.updateServiceShown(id, shown, storeId),
    // ✅ تم إزالة onMutate هنا أيضاً للأمان
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
    },
  });
}

// أسباب رفض الخدمة في الواجهة: RejectServiceModal يستخدم report-types من الويب (فئة reject-service)
export function useGetRejectionReasons() {
  return useQuery({
    queryKey: ["rejection-reasons"],
    queryFn: api.getRejectionReasons,
  });
}