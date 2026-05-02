// src/features/(dashboard)/mediaCenter/api.ts
import api from "@/src/lib/axios";

export interface MediaItem {
  id: number;
  file_type: string;
  file_name: string;
  size: string;
  title: string;
  alt: string;
  dimensions: string;
  user_id: string;
  store_id: string | null;
  created_at: string;
  updated_at: string;
  url: string;
  /** للصور غالباً نفس `url`؛ لغير الصور الباك قد يضع مسار أيقونة امتداد — للعرض استخدم `getMediaPreviewUrl` */
  src: string;
}

/** رابط المعاينة الفعلي (ملف التخزين). تجنّب `src` للفيديو/ملفات لأن API قد يعيد assets/icons/mp4.png وغيره. */
export function getMediaPreviewUrl(item: Pick<MediaItem, "url" | "src">): string {
  return item.url || item.src;
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedMediaData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: MediaItem[];
}

export interface ListMediaResponse extends BaseResponse {
  data: PaginatedMediaData;
}

export interface SingleMediaResponse extends BaseResponse {
  data: MediaItem;
}

export interface AddMediaPayload {
  type:
    | "image"
    | "video"
    | "file"
    | "pdf"
    | "avatar"
    | "gallery"
    | "word"
    | "excel"
    | "powerpoint"
    | string;
  file: File;
}

export interface DeleteMediaPayload {
  file_name: string;
}

type Primitive = string | number | boolean;
type FileLike = Blob | File;
type Allowed =
  | Primitive
  | Date
  | FileLike
  | (Primitive | Date | FileLike)[]
  | null
  | undefined;

const isFileLike = (v: unknown): v is FileLike =>
  v instanceof Blob || v instanceof File;

const toAppendable = (v: Primitive | Date): string =>
  v instanceof Date ? v.toISOString() : String(v);

type AllowedShape<T> = { [K in keyof T]: Allowed };

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

export const getMediaList = async (
  params: URLSearchParams
): Promise<ListMediaResponse> => {
  const { data } = await api.get<ListMediaResponse>(
    `/media-center/list?${params.toString()}`
  );
  return data;
};

export const uploadMedia = async (
  payload: AddMediaPayload
): Promise<SingleMediaResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SingleMediaResponse>(
    "/media-center/add-new",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

export const deleteMedia = async (
  payload: DeleteMediaPayload
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(
    `/media-center/delete?file_name=${encodeURIComponent(payload.file_name)}`
  );
  return data;
};