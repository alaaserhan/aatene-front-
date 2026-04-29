// src/features/(dashboard)/mediaCenter/hooks.ts
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import {
  getMediaList,
  uploadMedia,
  deleteMedia,
  AddMediaPayload,
  DeleteMediaPayload,
  ListMediaResponse,
  MediaItem,
  BaseResponse,
  SingleMediaResponse,
} from "./api";
import { toast } from "sonner";

const QK = {
  any: ["mediaCenter"] as const,
  listAny: ["mediaCenter", "list"] as const,
  list: (paramsString: string) =>
    ["mediaCenter", "list", paramsString] as const,
};

export const useGetMediaList = (params: URLSearchParams, enabled: boolean = true) => {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => getMediaList(params),
    enabled,
  });
};

export const useUploadMedia = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: (data: SingleMediaResponse) => {
      toast.success(data.message || "تم رفع الملف بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
    onError: (error) => {
      console.error("Media upload failed:", error);
    },
  });
};

export const useDeleteMedia = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,

    onMutate: async (variables: DeleteMediaPayload) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      const prevLists = qc.getQueriesData<ListMediaResponse>({
        queryKey: QK.listAny,
      });

      prevLists.forEach(([key, oldData]) => {
        const items = oldData?.data?.data;
        if (Array.isArray(items)) {
          qc.setQueryData(key, {
            ...oldData,
            data: {
              ...oldData!.data,
              data: items.filter(
                (item: MediaItem) => item.file_name !== variables.file_name
              ),
            },
          });
        }
      });

      return { prevLists };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم حذف الملف بنجاح");
    },

    onError: (_err, variables, ctx) => {
      toast.error("فشل حذف الملف، جاري التراجع");
      if (ctx?.prevLists) {
        ctx.prevLists.forEach(([queryKey, snapshot]) => {
          qc.setQueryData(queryKey, snapshot);
        });
      }
    },

    onSettled: (data, error, variables) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};