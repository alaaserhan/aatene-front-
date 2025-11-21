import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

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

export interface BaseResponse {
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
  const endpoint = getDynamicEndpoint("/cities");
  const { data } = await api.get<PaginatedCitiesResponse>(
    `${endpoint}?${params.toString()}`
  );
  return data;
};

export const createCity = async (
  payload: CityCreatePayload
): Promise<CityResponse> => {
  const endpoint = getDynamicEndpoint("/cities");
  const { data } = await api.post<CityResponse>(endpoint, payload);
  return data;
};

export const updateCity = async (
  id: number | string,
  payload: CityUpdatePayload
): Promise<CityResponse> => {
  const endpoint = getDynamicEndpoint(`/cities/${id}`);
  const { data } = await api.post<CityResponse>(endpoint, payload);
  return data;
};

export const deleteCity = async (
  id: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/cities/${id}`);
  const { data } = await api.delete<BaseResponse>(endpoint);
  return data;
};

export const updateCityStatus = async (
  id: number | string,
  payload: UpdateStatusPayload
): Promise<CityResponse> => {
  const endpoint = getDynamicEndpoint(`/cities/${id}/update-status`);
  const { data } = await api.post<CityResponse>(
    endpoint,
    payload
  );
  return data;
};