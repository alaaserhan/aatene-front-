// src/features/(dashboard)/users/components/UserListSidebar.tsx
"use client";

import { User, PaginatedUsersResponse } from "../api";
import { Input } from "@/src/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

interface UserListSidebarProps {
  usersData: PaginatedUsersResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedUserId: number | null;
  onSelectUser: (user: User) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const statusFilterOptions = [
  { label: "الكل", value: "all" },
  { label: "مفعل", value: "1" },
  { label: "غير مفعل", value: "0" },
];

export function UserListSidebar({
  usersData,
  isLoading,
  isError,
  selectedUserId,
  onSelectUser,
  searchQuery,
  onSearchChange,
  className,
  statusFilter,
  onStatusFilterChange,
}: UserListSidebarProps) {
  const users: User[] = usersData?.data || [];

  const getStatusProps = (user: User) => {
    const isActive = user.is_active === "1" || user.is_active === true;

    if (isActive) {
      return {
        text: "مفعل",
        color: "text-green-600",
        dot: "bg-green-500",
      };
    }

    return {
      text: "غير مفعل",
      color: "text-red-600",
      dot: "bg-red-500",
    };
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg flex flex-col overflow-hidden",
        className
      )}
    >
      <div className="p-3 border-b border-gray-200 flex gap-2 flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="ابحث باسم الموظف "
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-3 py-3 h-10 border-gray-300 rounded-sm text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#3A5779] focus:border-transparent"
          />
        </div>

        <ReusableDropdown
          options={statusFilterOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
          showSelectedLabel={true}
          triggerIcon={
            <img
              src="/icons/dashboard/order.svg"
              alt="filter"
              className="w-4 h-4"
            />
          }
          className="min-w-[120px]"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <p className="text-sm text-red-500">حدث خطأ في جلب المستخدمين</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <p className="text-sm text-gray-500">لا يوجد مستخدمين</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user) => {
              const isSelected = selectedUserId === user.id;
              const fullName =
                `${user.first_name || ""} ${user.last_name || ""}`.trim();
              const roleName = user.roles?.[0]?.name || "مستخدم";
              const status = getStatusProps(user);

              return (
                <div
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={cn(
                    "flex gap-3 p-4 cursor-pointer transition-colors",
                    isSelected ? "bg-blue-5" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={user.avatar_url || "/default-avatar.png"}
                      alt={fullName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate mb-1.5">
                      {user.first_name}
                    </p>
                    <p className="text-xs text-gray-2 truncate">
                      {roleName}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 h-fit",
                      status.color
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full shadow mt-0.5",
                        status.dot
                      )}
                    />
                    <span className="text-xs font-medium">{status.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}