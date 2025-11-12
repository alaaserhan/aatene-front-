// src/features/(dashboard)/users/components/UsersPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useGetUsers } from "../hooks";
import { User } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { UserFilterPanel } from "./UserFilterPanel";
import { UserListSidebar } from "./UserListSidebar";
import { UserDetailsSidebar } from "./UserDetailsSidebar";

// (هذه القيم ثابتة بناءً على التصميم، يمكن ربطها بالـ API لاحقاً)
const filterCategories = [
  { name: "الكل", value: "all" },
  { name: "مستخدمين", value: "user" },
  { name: "موظفين", value: "employee" },
];

export function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10"); // (يمكن تغييره)

    if (searchQuery) {
      params.set("search", searchQuery);
    }
    
    // (هنا يمكنك إضافة لوجيك الفلترة بناءً على `activeFilter` إذا كان الـ API يدعمه)
    // if (activeFilter !== "all") {
    //   params.set("role", activeFilter);
    // }

    return params;
  }, [currentPage, searchQuery, activeFilter]);

  const { data: usersData, isLoading, isError } = useGetUsers(queryParams);

  const breadcrumbItems = [
    { label: "الحسابات", href: "/admin/users" },
    { label: "الادوار والصلاحيات", href: "/admin/roles" },
  ];

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id);
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white z-10">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <nav className="flex items-center h-full">
            <ul className="flex items-center gap-x-8 h-full">
              {breadcrumbItems.map((link) => (
                <li key={link.label} className="h-full flex items-center">
                  <a
                    href={link.href}
                    className={`text-sm font-semibold transition-colors h-full flex items-center ${
                      link.href === "/admin/users"
                        ? "text-[#3A5779] border-b-2 border-[#3A5779]"
                        : "text-gray-500 hover:text-[#3A5779]"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-x-3">
            <Button className="flex items-center justify-center gap-x-2 px-4 py-2 bg-[#3A5779] text-white rounded-md text-sm font-semibold hover:bg-opacity-90 transition-opacity cursor-pointer">
              <Plus className="w-5 h-5" />
              إضافة مستخدم
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content (3-Column Layout) */}
      <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-12 gap-6 items-start h-full">
          {/* 1. Filter Panel (Right) */}
          <div className="col-span-12 lg:col-span-2 h-full sticky top-4">
            <UserFilterPanel
              categories={filterCategories}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* 2. User List (Middle) */}
          <div className="col-span-12 lg:col-span-3 h-full">
            <UserListSidebar
              usersData={usersData}
              isLoading={isLoading}
              isError={isError}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* 3. User Details (Left) */}
          <div className="col-span-12 lg:col-span-7 h-full sticky top-4 overflow-y-auto">
            <UserDetailsSidebar
              selectedUserId={selectedUserId}
              onUserUpdate={() => setSelectedUserId(null)} // لإلغاء التحديد بعد الحفظ
              onUserDelete={() => setSelectedUserId(null)} // لإلغاء التحديد بعد الحذف
            />
          </div>
        </div>
      </main>
    </div>
  );
}