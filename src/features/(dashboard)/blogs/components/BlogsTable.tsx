"use client";

import { Eye, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Blog } from "../api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BlogsTableProps {
  data: Blog[];
  isLoading: boolean;
  onEdit: (blog: Blog) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
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
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-right">
              <th className="px-6 py-4 text-sm font-medium  w-[30%]">عنوان المقال</th>
              <th className="px-6 py-4 text-center text-sm font-medium ">للمفضلة</th>
              <th className="px-6 py-4 text-center text-sm font-medium ">التقييم</th>
              <th className="px-6 py-4 text-center text-sm font-medium ">عدد التعليقات</th>
              <th className="px-6 py-4 text-center text-sm font-medium ">تاريخ النشر</th>
              <th className="px-6 py-4 text-center text-sm font-medium ">عمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((blog) => (
              <tr key={blog.id} className="group hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-blue-4 hover:underline cursor-pointer">
                    {blog.title}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-2">{blog.favorites_count || 0}</span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full w-fit mx-auto border border-yellow-100">
                    <span className="text-xs font-bold text-gray-700">{blog.review_rate}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-2">{blog.review_count || 0}</span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-xs  font-medium">
                    {blog.created_at
                      ? format(new Date(blog.created_at), "yyyy-MM-dd", { locale: ar })
                      : "-"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(blog)}
                      className="bg-gray-50  hover:bg-blue-50 hover:text-blue-3 h-8 w-8 rounded-xs"
                    >
                      <img src="/icons/dashboard/edit3.svg" alt="Edit" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(blog.id)}
                      className="bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 h-8 w-8 rounded-xs"
                    >
                      <img src="/icons/dashboard/trash.svg" alt="Delete" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(blog.id)}
                      className="bg-cyan-50 text-cyan-500 hover:bg-cyan-100 h-8 w-8 rounded-xs"
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