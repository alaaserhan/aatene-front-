// src/features/(dashboard)/cities/api.ts
import api from "@/src/lib/axios";

type Primitive = string | number | boolean;
type FileLike = Blob | File;
type Allowed =
  | Primitive
  | Date
  | FileLike
  | (Primitive | Date | FileLike)[]
  | null
  | undefined;

type AllowedShape<T> = { [K in keyof T]: Allowed };

export interface City {
  id: number;
  name: string;
  is_active: boolean;
}

export interface CityCreatePayload {
  name: string;
  is_active: "0" | "1";
  districts?: string[];
}

export interface CityUpdatePayload {
  name?: string;
  is_active?: "0" | "1";
  districts?: string[];
}

export interface UpdateStatusPayload {
  is_active: "0" | "1";
}

interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedCitiesResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: City[];
}

export interface CityResponse extends BaseResponse {
  record: City;
}

const isFileLike = (v: unknown): v is FileLike =>
  v instanceof Blob || v instanceof File;

const toAppendable = (v: Primitive | Date): string =>
  v instanceof Date ? v.toISOString() : String(v);

export const createFormData = <T extends object>(
  data: AllowedShape<T>
): FormData => {
  const fd = new FormData();

  (Object.entries(data) as [keyof T, Allowed][]).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        fd.append(
          String(key),
          isFileLike(item) ? item : toAppendable(item as Primitive | Date)
        );
      });
      return;
    }

    fd.append(
      String(key),
      isFileLike(value) ? value : toAppendable(value as Primitive | Date)
    );
  });

  return fd;
};

export const getCities = async (
  params: URLSearchParams
): Promise<PaginatedCitiesResponse> => {
  const { data } = await api.get<PaginatedCitiesResponse>(
    `/admin/cities?${params.toString()}`
  );
  return data;
};

export const createCity = async (
  payload: CityCreatePayload
): Promise<CityResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<CityResponse>("/admin/cities", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateCity = async (
  id: number | string,
  payload: CityUpdatePayload
): Promise<CityResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<CityResponse>(`/admin/cities/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteCity = async (id: number | string): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/cities/${id}`);
  return data;
};

export const updateCityStatus = async (
  id: number | string,
  payload: UpdateStatusPayload
): Promise<CityResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<CityResponse>(
    `/admin/cities/${id}/update-status`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};