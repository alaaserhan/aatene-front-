import api from "@/src/lib/axios";

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
  const { data } = await api.post<CityResponse>("/admin/cities", payload);
  return data;
};

export const updateCity = async (
  id: number | string,
  payload: CityUpdatePayload
): Promise<CityResponse> => {
  const { data } = await api.post<CityResponse>(`/admin/cities/${id}`, payload);
  return data;
};

export const deleteCity = async (
  id: number | string
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/cities/${id}`);
  return data;
};

export const updateCityStatus = async (
  id: number | string,
  payload: UpdateStatusPayload
): Promise<CityResponse> => {
  const { data } = await api.post<CityResponse>(
    `/admin/cities/${id}/update-status`,
    payload
  );
  return data;
};