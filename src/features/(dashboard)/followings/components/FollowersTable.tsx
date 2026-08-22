"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Plus, MessageCircle, MoreVertical, Loader2 } from "lucide-react";
import { FollowEntity } from "../api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { ChatNowButton } from "@/src/components/shared/ChatNowButton";

interface FollowersTableProps {
  data: FollowEntity[];
  type: "followers" | "followings";
  onFollowBack: (item: FollowEntity) => void;
  onUnfollow: (item: FollowEntity) => void;
  onRemoveFollower: (item: FollowEntity) => void;
  onBlock: (item: FollowEntity) => void;
  isActionPending: boolean;
  targetId?: number | string | null;
}

function ActionDropdown({
  item,
  type,
  onUnfollow,
  onRemoveFollower,
  onBlock,
}: {
  item: FollowEntity;
  type: "followers" | "followings";
  onUnfollow: (item: FollowEntity) => void;
  onRemoveFollower: (item: FollowEntity) => void;
  onBlock: (item: FollowEntity) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileHref = item.type === "store" ? `/store/${item.slug}` : `/profile/${item.slug}`;

  const showUnfollow = type === "followings" || (type === "followers" && item.is_following_back);
  const showRemove = type === "followers" && !item.is_following_back;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {open && (
        <div className="absolute left-0 bottom-11 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px] py-1">
          <Link
            href={profileHref}
            className="block w-full text-start px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            مشاهدة الملف الشخصي
          </Link>

          {showUnfollow && (
            <button
              className="block w-full text-start px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                onUnfollow(item);
                setOpen(false);
              }}
            >
              إلغاء متابعة
            </button>
          )}

          {showRemove && (
            <button
              className="block w-full text-start px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                onRemoveFollower(item);
                setOpen(false);
              }}
            >
              إزالة من متابعينك
            </button>
          )}

          <button
            className="block w-full text-start px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => {
              onBlock(item);
              setOpen(false);
            }}
          >
            حظر
          </button>
        </div>
      )}
    </div>
  );
}

export function FollowersTable({
  data,
  type,
  onFollowBack,
  onUnfollow,
  onRemoveFollower,
  onBlock,
  isActionPending,
  targetId,
}: FollowersTableProps) {
  return (
    <div className=" bg-white rounded-lg border border-gray-100">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-4 text-start text-sm font-medium w-1/3">الاسم</th>
            <th className="px-6 py-4 text-center text-sm font-medium w-1/3">التاريخ والوقت</th>
            <th className="px-6 py-4 text-center text-sm font-medium w-1/3">عمليات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const isPending = isActionPending && targetId === item.id;

            return (
              <tr key={`${item.id}-${index}`} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none">
                <td className="px-6 py-4">
                  <Link
                    href={item.type === "store" ? `/store/${item.slug}` : `/profile/${item.slug}`}
                    className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-10 h-10 border border-gray-100">
                      <AvatarImage src={item.image} alt={item.name} />
                      <AvatarFallback>{item.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </Link>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-2" dir="ltr">
                    {item.started_at
                      ? format(new Date(item.started_at), "yyyy-MM-dd - hh a", { locale: ar })
                      : "-"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                

                    {type === "followings" || (type === "followers" && item.is_following_back) ? (
                      <ChatNowButton
                        variant="outline"
                        target={{ type: item.type as "store" | "user", id: item.id }}
                        basePath="/admin/chat"
                        label="مراسلة"
                        icon={<MessageCircle className="w-4 h-4" />}
                        iconClassName="w-4 h-4"
                        className="text-blue-3 w-28 shadow-none  rounded bg-blue-5 border-none gap-2 h-9 px-4 text-sm  font-medium"
                      />
                    ) : (
                      <Button
                        onClick={() => onFollowBack(item)}
                        disabled={isPending}
                        className="bg-blue-4 shadow-none border-none rounded text-white w-28 gap-2 h-9 px-4 text-sm font-medium "
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            رد المتابعة
                          </>
                        )}
                      </Button>
                    )}
                        <ActionDropdown
                      item={item}
                      type={type}
                      onUnfollow={onUnfollow}
                      onRemoveFollower={onRemoveFollower}
                      onBlock={onBlock}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}