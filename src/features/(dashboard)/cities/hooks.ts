"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
  updateCityStatus,
  CityUpdatePayload,
  UpdateStatusPayload,
  CityCreatePayload,
  CityResponse,
  PaginatedCitiesResponse,
  City,
} from "./api";
import { toast } from "sonner";

const QK = {
  any: ["cities"] as const,
  listAny: ["cities", "list"] as const,
  list: (paramsString: string) => ["cities", "list", paramsString] as const,
  single: (id: string | number) => ["cities", "single", String(id)] as const,
};

const coerceActive = (v: unknown) => v === "1" || v === 1 || v === true;

export const useGetCities = (params: URLSearchParams) => {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => getCities(params),
  });
};

export const useCreateCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CityCreatePayload) => createCity(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم إضافة المدينة بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useUpdateCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: number | string;
      payload: CityUpdatePayload;
    }) => updateCity(variables.id, variables.payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK.any });

      const prevLists = qc.getQueriesData<PaginatedCitiesResponse>({
        queryKey: QK.listAny,
      });

      const nextPayload = {
        ...vars.payload,
        is_active:
          vars.payload.is_active !== undefined
            ? coerceActive(vars.payload.is_active)
            : undefined,
      };

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedCitiesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((city: City) =>
              city.id === Number(vars.id) ? { ...city, ...nextPayload } : city
            ),
          };
        });
      });

      return { prevLists };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تعديل المدينة بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء التعديل");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.single(vars.id) });
    },
  });
};

export const useDeleteCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteCity(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      const prevLists = qc.getQueriesData<PaginatedCitiesResponse>({
        queryKey: QK.listAny,
      });

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedCitiesResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter(
            (city: City) => city.id !== Number(id)
          );
          const nextCount =
            typeof old.recordsFiltered === "number"
              ? Math.max(0, old.recordsFiltered - 1)
              : nextData.length;
          return { ...old, data: nextData, recordsFiltered: nextCount };
        });
      });

      qc.removeQueries({ queryKey: QK.single(id) });
      return { prevLists };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم حذف المدينة بنجاح");
    },

    onError: (_err, id, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useUpdateCityStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: number | string;
      payload: UpdateStatusPayload;
    }) => updateCityStatus(variables.id, variables.payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK.any });

      const nextActive = coerceActive(vars.payload.is_active);

      const prevLists = qc.getQueriesData<PaginatedCitiesResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<CityResponse>(QK.single(vars.id));

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedCitiesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((city: City) =>
              city.id === Number(vars.id)
                ? { ...city, is_active: nextActive }
                : city
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(QK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, is_active: nextActive },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الحالة بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء تحديث الحالة");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle) qc.setQueryData(QK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.single(vars.id) });
    },
  });
};