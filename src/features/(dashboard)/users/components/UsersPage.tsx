// src/features/(dashboard)/users/components/UsersPage.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { useInfiniteGetUsers } from "../hooks";
import { useGetRoles } from "../../roles/hooks";
import { User } from "../api";
import { Plus } from "lucide-react";
import { UserListSidebar } from "./UserListSidebar";
import { UserDetailsSidebar } from "./UserDetailsSidebar";
import Link from "next/link";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";

export function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoleName, setActiveRoleName] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const detailsRef = useRef<HTMLDivElement>(null);

  const { data: rolesData } = useGetRoles(new URLSearchParams());

  const filterCategories = useMemo(() => {
    const baseFilters = [{ name: "الكل", value: "all" }];
    const rolesFilters =
      rolesData?.data.map((role) => ({
        name: role.title || role.name,
        value: String(role.id),
      })) || [];
    return [...baseFilters, ...rolesFilters];
  }, [rolesData]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "10");

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (activeRoleName !== "all") {
      params.set("roles", activeRoleName);
    }

    if (statusFilter !== "all") {
      params.set("is_active", statusFilter);
    }

    return params;
  }, [searchQuery, activeRoleName, statusFilter]);

  // استخدام useInfiniteGetUsers بدلاً من useGetUsers
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteGetUsers(queryParams);

  // دمج الصفحات في مصفوفة واحدة
  const allUsers = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id);

    if (window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleUserUpdate = () => {};

  const handleUserDelete = () => {
    setSelectedUserId(null);
  };

  const handleRoleFilterChange = (roleName: string) => {
    setActiveRoleName(roleName);
    setSelectedUserId(null);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setSelectedUserId(null);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedUserId(null);
  };

  return (
    <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)]  flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
        <div className="flex items-center justify-between h-16 px-6">
          <nav className="flex items-center h-full">
            <ul className="flex items-center gap-8 h-full">
              <li className="h-full flex items-center">
                <Link
                  href="/admin/users"
                  className="text-sm font-semibold text-[#3A5779] border-b-2 border-[#3A5779] h-full flex items-center transition-colors"
                >
                  الحسابات
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link
                  href="/admin/permissions"
                  className="text-sm font-semibold text-gray-500 hover:text-[#3A5779] h-full flex items-center transition-colors"
                >
                  الادوار والصلاحيات
                </Link>
              </li>
            </ul>
          </nav>

          <Link
            href="/admin/users/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-3 rounded-xs text-white text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            إضافة مستخدم
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 h-[calc(100vh-65px)]">
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-12 lg:col-span-2 h-full">
            <SidebarFilterPanel
              options={filterCategories}
              activeValue={activeRoleName}
              onValueChange={handleRoleFilterChange}
              className="h-full max-h-[calc(100vh-193px)] overflow-y-auto"
            />
          </div>

          <div className="col-span-12 lg:col-span-3 h-full">
            <UserListSidebar
              users={allUsers} // تمرير البيانات المدمجة
              isLoading={isLoading}
              isError={isError}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              className="h-full"
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              // --- تمرير دوال Infinite Scroll ---
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>

          <div className="col-span-12 lg:col-span-7 h-full" ref={detailsRef}>
            <UserDetailsSidebar
              selectedUserId={selectedUserId}
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
              className="h-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
}