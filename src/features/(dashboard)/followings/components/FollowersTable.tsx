//src/features/(dashboard)/followings/components/FollowersTable.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { FollowEntity } from "../api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface FollowersTableProps {
  data: FollowEntity[];
  type: "followers" | "followings";
  onAction: (item: FollowEntity) => void;
  isActionPending: boolean;
  targetId?: number | string | null;
}

export function FollowersTable({ 
    data, 
    type, 
    onAction, 
    isActionPending,
    targetId 
}: FollowersTableProps) {
    
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-100">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-4 text-start text-sm font-medium text-gray-500 w-1/2">الاسم</th>
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 w-1/4">التاريخ والوقت</th>
            <th className="px-6 py-4 text-end text-sm font-medium text-gray-500 w-1/4">عمليات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-gray-100">
                    <AvatarImage src={item.image} alt={item.name} />
                    <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
              </td>
              
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-gray-500" dir="ltr">
                  {item.started_at 
                    ? format(new Date(item.started_at), "yyyy-MM-dd - hh a", { locale: ar })
                    : "-"}
                </span>
              </td>

              <td className="px-6 py-4 text-end">
                {type === "followings" ? (
                  // زر إلغاء المتابعة (أحمر)
                  <Button
                    onClick={() => onAction(item)}
                    disabled={isActionPending && targetId === item.id}
                    variant="ghost"
                    className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 gap-2 h-9 px-4 text-xs font-medium"
                  >
                    إلغاء المتابعة
                    <Minus className="w-3 h-3" />
                  </Button>
                ) : (
                  // زر المتابعة (أزرق)
                  // يظهر فقط إذا لم أكن أتابعه بالفعل (في حالة المتابعين)
                    !item.is_following_back && (
                        <Button
                            onClick={() => onAction(item)}
                            disabled={isActionPending && targetId === item.id}
                            className="bg-blue-3 text-white hover:bg-blue-4 gap-2 h-9 px-6 text-xs font-medium"
                        >
                            متابعة
                            <Plus className="w-4 h-4" />
                        </Button>
                    )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}