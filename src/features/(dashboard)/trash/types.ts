// خيار من /admin/trashed/options 
export interface TrashOption {
  slug: string;
  name: string;
}

// عنصر محذوف في الجدول
export interface TrashedItem {
  id: number;
  name: string;
  category_name?: string;
  shown?: boolean;
  deleted_at?: string;
}

// استجابة جلب الخيارات المتاحة
export interface TrashOptionsResponse {
  status: boolean;
  message: string;
  data: TrashOption[];
}

// استجابة جلب العناصر المحذوفة (مع pagination)
export interface TrashedItemsResponse {
  status: boolean;
  message: string;
  recordsTotal: number;
  recordsFiltered: number;
  data: TrashedItem[];
}

// استجابة الاسترجاع أو الحذف النهائي
export interface TrashActionResponse {
  status: boolean;
  message: string;
}
