// src/features/(dashboard)/services/hooks.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

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
      toast.success("تم إنشاء الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
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
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storeId }: { id: number | string; storeId?: number | string }) =>
      api.deleteService(id, storeId),
    onSuccess: () => {
      toast.success("تم حذف الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
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
      toast.success("تم تحديث الحالة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      console.error("Update Status Error:", error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الحالة");
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
      toast.success("تم تحديث حالة الظهور بنجاح");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التحديث");
    },
  });
}

// إضافة هوك لجلب أسباب الرفض (مطلوب لـ RejectServiceModal)
export function useGetRejectionReasons() {
  return useQuery({
    queryKey: ["rejection-reasons"],
    queryFn: api.getRejectionReasons,
  });
}