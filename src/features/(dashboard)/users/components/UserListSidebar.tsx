// src/features/(dashboard)/users/components/UserListSidebar.tsx
"use client";

import { User } from "../api";
import { cn } from "@/src/lib/utils";
import { GenericSidebarList } from "@/src/components/(dashboard)/GenericSidebarList";

interface UserListSidebarProps {
  users: User[]; // نستقبل المصفوفة مباشرة الآن
  isLoading: boolean;
  isError: boolean;
  selectedUserId: number | null;
  onSelectUser: (user: User) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  // --- Props Infinite Scroll ---
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const statusFilterOptions = [
  { label: "الكل", value: "all" },
  { label: "مفعل", value: "1" },
  { label: "غير مفعل", value: "0" },
];

export function UserListSidebar({
  users,
  isLoading,
  isError,
  selectedUserId,
  onSelectUser,
  searchQuery,
  onSearchChange,
  className,
  statusFilter,
  onStatusFilterChange,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: UserListSidebarProps) {
  
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
    <GenericSidebarList
      data={users}
      isLoading={isLoading}
      isError={isError}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      filterValue={statusFilter}
      onFilterChange={onStatusFilterChange}
      filterOptions={statusFilterOptions}
      className={className}
      emptyText="لا يوجد مستخدمين"
      selectedId={selectedUserId}
      // --- تمرير Props Infinite Scroll ---
      onLoadMore={onLoadMore}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      
      renderItem={(user) => {
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
              <p className="text-xs text-gray-2 truncate">{roleName}</p>
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
      }}
    />
  );
}