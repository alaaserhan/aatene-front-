// src/features/(dashboard)/users/components/UserListSidebar.tsx
"use client";

import { User } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ListFilter, Loader2, Search } from "lucide-react";
import { UserStatusIndicator } from "./UserStatusIndicator";


interface UserListSidebarProps {
  usersData: any; // (PaginatedUsersResponse | undefined)
  isLoading: boolean;
  isError: boolean;
  selectedUserId: number | null;
  onSelectUser: (user: User) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function UserListSidebar({
  usersData,
  isLoading,
  isError,
  selectedUserId,
  onSelectUser,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  currentPage,
  onPageChange,
}: UserListSidebarProps) {
  const users: User[] = usersData?.data || [];
  const totalPages = Math.ceil(
    (usersData?.recordsFiltered || 0) / (Number(usersData?.per_page) || 10)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="ابحث باسم الموظف او رقم الهاتف"
            className="w-full bg-gray-50 py-2.5 ps-10 pe-4 border-gray-300 rounded-lg text-start"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header & Sort */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">بيانات الموظف</h3>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 cursor-pointer">
          <ListFilter className="w-5 h-5" /> ترتيب
        </Button>
      </div>

      {/* User List */}
      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="text-center p-4 text-red-500">
            حدث خطأ في جلب المستخدمين.
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            لا يوجد مستخدمين.
          </div>
        ) : (
          users.map((user) => {
            const isSelected = selectedUserId === user.id;
            const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
            return (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                  isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="form-checkbox h-5 w-5 text-[#3A5779] rounded border-gray-300 focus:ring-[#3A5779] cursor-pointer"
                />
                <img
                  src={user.avatar_url}
                  alt={fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-grow">
                  <p className="font-bold text-gray-800">{fullName}</p>
                  <p className="text-sm text-gray-500">
                    {user.roles[0]?.name || "مستخدم"}
                  </p>
                </div>
                <UserStatusIndicator isActive={user.is_active === "1" || user.is_active === true} />
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
            className={isLoading ? "opacity-50 pointer-events-none" : ""}
          />
        </div>
      )}
    </div>
  );
}