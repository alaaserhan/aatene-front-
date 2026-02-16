// فئات الشريط الجانبي
export interface TrashCategory {
  id: string;
  name: string;
  count?: number;
}

// عنصر محذوف في الجدول
export interface TrashedItem {
  id: number;
  name: string;
  category_name?: string;
  shown?: boolean;
  deleted_at?: string;
}

export interface TrashCategoriesResponse {
  status: boolean;
  message: string;
  data: TrashCategory[];
}

export interface TrashedItemsResponse {
  status: boolean;
  message: string;
  recordsTotal: number;
  recordsFiltered: number;
  data: TrashedItem[];
}

export interface TrashActionResponse {
  status: boolean;
  message: string;
}
