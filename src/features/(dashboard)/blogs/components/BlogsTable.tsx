"use client";

import { Eye, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Blog } from "../api";
import { formatDate } from "@/src/lib/date-helper";

interface BlogsTableProps {
  data: Blog[];
  isLoading: boolean;
  onEdit: (blog: Blog) => void;
  onDelete: (id: number) => void;
  onView: (slug: string) => void;
}

export function BlogsTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: BlogsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white rounded-lg border border-gray-100">
        <span className="text-gray-2 text-sm">جاري تحميل المقالات...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white rounded-lg border border-gray-100">
        <span className="text-gray-2 text-sm">لا توجد مقالات لعرضها</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-right">
              <th className="px-6 py-4 text-sm font-bold text-gray-500 w-[30%] whitespace-nowrap">عنوان المقال</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-500 whitespace-nowrap">المفضلة</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-500 whitespace-nowrap">التقييم</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-500 whitespace-nowrap">التعليقات</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-500 whitespace-nowrap">تاريخ النشر</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-500 whitespace-nowrap">عمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-blue-4 hover:text-blue-6 cursor-pointer transition-colors line-clamp-1">
                    {blog.title}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-gray-500">{blog.favorites_count || 0}</span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
                    <span className="text-xs font-bold text-gray-700">{blog.review_rate || "0.0"}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-gray-500">{blog.review_count || 0}</span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-medium text-gray-400">
                    {blog.created_at ? formatDate(blog.created_at) : "-"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(blog)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-500 h-8 w-8 rounded-lg transition-all"
                      title="تعديل"
                    >
                      <img src="/icons/dashboard/edit3.svg" alt="Edit" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(blog.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-500 h-8 w-8 rounded-lg transition-all"
                      title="حذف"
                    >
                      <img src="/icons/dashboard/trash.svg" alt="Delete" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(blog.slug)}
                      className="bg-cyan-50 hover:bg-cyan-100 text-cyan-500 h-8 w-8 rounded-lg transition-all"
                      title="عرض"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}