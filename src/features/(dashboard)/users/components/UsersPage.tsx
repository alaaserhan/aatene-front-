// src/features/(dashboard)/users/components/UsersPage.tsx
"use client";

// <-- 1. استيراد useRef
import { useState, useMemo, useRef } from "react";
import { useGetUsers } from "../hooks";
import { User } from "../api";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { UserFilterPanel } from "./UserFilterPanel";
import { UserListSidebar } from "./UserListSidebar";
import { UserDetailsSidebar } from "./UserDetailsSidebar";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

const filterCategories = [
  { name: "الكل", value: "all" },
  { name: "مستخدمين", value: "users" },
  { name: "موظفين", value: "employees" },
];

export function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // <-- 2. إضافة ref لعنصر التفاصيل
  const detailsRef = useRef<HTMLDivElement>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10");

    if (searchQuery) {
      params.set("first_name", searchQuery);
    }

    return params;
  }, [currentPage, searchQuery]);

  const { data: usersData, isLoading, isError } = useGetUsers(queryParams);

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id);

    // <-- 3. إضافة منطق الـ scroll للموبايل
    // 1024px هو الـ breakpoint الخاص بـ lg في Tailwind
    if (window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleUserUpdate = () => {
    // Refresh list or clear selection
  };

  const handleUserDelete = () => {
    setSelectedUserId(null);
  };

  return (
    // <-- 4. تغيير min-h-screen إلى h-screen لفرض ارتفاع 100vh
    <div className=" bg-gray-50 h-full lg:min-h-[calc(100vh-85px)] flex flex-col">
      {/* Header (يبقى كما هو) */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Navigation Tabs */}
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
                  href="/admin/roles"
                  className="text-sm font-semibold text-gray-500 hover:text-[#3A5779] h-full flex items-center transition-colors"
                >
                  الادوار والصلاحيات
                </Link>
              </li>
            </ul>
          </nav>

          {/* Add User Button */}
          <Button className="flex items-center gap-2 px-4 py-2 bg-[#3A5779] hover:bg-[#2d4460] text-white text-sm font-semibold cursor-pointer">
            <Plus className="w-5 h-5" />
            إضافة مستخدم
          </Button>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      {/* <-- 5. إضافة overflow-hidden لمنع الـ main من الـ scroll */}
      <main className="flex-1 p-6 overflow-hidden">
        {/* <-- 6. إضافة h-full ليأخذ الـ grid كامل ارتفاع الـ main */}
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* 1. Filter Panel (Right) - 2 columns */}
          {/* <-- 7. إضافة h-full للعامود */}
          <div className="col-span-12 lg:col-span-2">
            <UserFilterPanel
              categories={filterCategories}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* 2. User List (Middle) - 3 columns */}
          {/* <-- 8. إضافة h-full للعامود */}
          <div className="col-span-12 lg:col-span-3">
            <UserListSidebar
              usersData={usersData}
              isLoading={isLoading}
              isError={isError}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* 3. User Details (Left) - 7 columns */}
          {/* <-- 9. إضافة h-full وربط الـ ref هنا */}
          <div className="col-span-12 lg:col-span-7 h-full" ref={detailsRef}>
            <UserDetailsSidebar
              selectedUserId={selectedUserId}
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}