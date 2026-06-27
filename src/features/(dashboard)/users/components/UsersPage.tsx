// src/features/(dashboard)/users/components/UsersPage.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // 1. استيراد الـ Hooks الخاصة بالراوتر
import { useInfiniteGetUsers } from "../hooks";
import { useGetRoles } from "../../roles/hooks";
import { User } from "../api";
import { Plus } from "lucide-react";
import { UserListSidebar } from "./UserListSidebar";
import { UserDetailsSidebar } from "./UserDetailsSidebar";
import Link from "next/link";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";

export function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 2. قراءة الـ ID من الرابط بدلاً من State
  const userIdParam = searchParams.get("userId");
  const selectedUserId = userIdParam ? Number(userIdParam) : null;

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

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteGetUsers(queryParams);

  const allUsers = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  // 3. دالة مساعدة لتحديث الرابط
  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSelectUser = (user: User) => {
    // تحديث الرابط عند اختيار مستخدم
    updateUrl("userId", String(user.id));
  };

  // تأثير للتمرير (Scroll) في وضع الموبايل عند تغيير المستخدم في الرابط
  useEffect(() => {
    if (selectedUserId && window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedUserId]);

  const handleUserUpdate = () => {
    // يمكن هنا إعادة جلب البيانات إذا لزم الأمر
  };

  const handleUserDelete = () => {
    // إزالة المستخدم من الرابط عند الحذف
    updateUrl("userId", null);
  };

  const handleRoleFilterChange = (roleName: string) => {
    setActiveRoleName(roleName);
    updateUrl("userId", null); // إلغاء التحديد عند تغيير الفلتر
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    updateUrl("userId", null);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrl("userId", null);
  };

  return (
    <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)]  flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 min-h-[65px]">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 gap-3 flex-wrap">
          <nav className="flex items-center h-full">
            <ul className="flex items-center gap-4 sm:gap-8 h-full">
              <li className="h-full flex items-center">
                <Link
                  href="/admin/users"
                  className="text-xs sm:text-sm font-semibold text-[#3A5779] border-b-2 border-[#3A5779] h-full flex items-center transition-colors whitespace-nowrap"
                >
                  الحسابات
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link
                  href="/admin/permissions"
                  className="text-xs sm:text-sm font-semibold text-gray-2 hover:text-[#3A5779] h-full flex items-center transition-colors whitespace-nowrap"
                >
                  الأدوار والصلاحيات
                </Link>
              </li>
            </ul>
          </nav>

          <Link
            href="/admin/users/add"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-3 rounded-xs text-white text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            إضافة مستخدم
          </Link>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-1 md:p-6 min-h-0">
        <div className="grid grid-cols-12 gap-3 sm:gap-4 h-full">
          <div className="col-span-12 lg:col-span-2 h-full max-h-[200px] lg:max-h-none">
            <SidebarFilterPanel
              options={filterCategories}
              activeValue={activeRoleName}
              onValueChange={handleRoleFilterChange}
              className="h-full max-h-[calc(100vh-193px)] overflow-y-auto"
            />
          </div>

          <div className="col-span-12 lg:col-span-3 h-full">
            <UserListSidebar
              users={allUsers}
              isLoading={isLoading}
              isError={isError}
              selectedUserId={selectedUserId} // يتم تمرير الـ ID المأخوذ من الرابط
              onSelectUser={handleSelectUser}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              className="h-full"
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>

          <div className="col-span-12 lg:col-span-7 h-full" ref={detailsRef}>
            <UserDetailsSidebar
              selectedUserId={selectedUserId} // الكومبوننت سيقوم بجلب البيانات تلقائياً بناءً على هذا الـ ID
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