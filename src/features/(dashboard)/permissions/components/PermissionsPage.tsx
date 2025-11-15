// src/features/(dashboard)/permissions/components/PermissionsPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useGetRoles,
  useGetSingleRole,
  useUpdateRole,
  useCreateRole,
} from "../../roles/hooks";
import { useGetPermissions } from "../hooks";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoleListItem } from "../../roles/api";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";

export function PermissionsPage() {
  const [mode, setMode] = useState<"edit" | "create">("edit");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const { data: rolesData } = useGetRoles(new URLSearchParams());
  const roles = rolesData?.data || [];

  const { data: permissionsData } = useGetPermissions(new URLSearchParams());
  const allPermissions = permissionsData?.data || [];

  const { data: roleDetailsData, isLoading: isLoadingRole } = useGetSingleRole(
    mode === "edit" ? selectedRoleId || undefined : undefined
  );

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const isMutating =
    createRoleMutation.isPending || updateRoleMutation.isPending;

  useEffect(() => {
    if (mode === "edit" && roleDetailsData?.record) {
      const role = roleDetailsData.record;
      setRoleName(role.name || "");
      setRoleTitle(role.title ||"");
      setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    } else if (mode === "create") {
      setRoleName("");
      setRoleTitle("");
      setSelectedPermissions([]);
    }
  }, [mode, roleDetailsData, selectedRoleId]);

  const filterCategories = useMemo(() => {
    return roles.map((role: RoleListItem) => ({
      name: role.title || role.name,
      value: String(role.id),
    }));
  }, [roles]);

  const handleRoleSelect = (roleId: string) => {
    setMode("edit");
    setSelectedRoleId(Number(roleId));
  };

  const handleAddNewRole = () => {
    setMode("create");
    setSelectedRoleId(null);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const handleSave = () => {
    const titleToSave = roleTitle.trim();
    if (!titleToSave) {
      toast.error("اسم الدور الوظيفي مطلوب");
      return;
    }

    if (mode === "create") {
      createRoleMutation.mutate(
        {
          name: titleToSave,
          permissions: selectedPermissions,
        },
        {
          onSuccess: (data) => {
            toast.success("تم إنشاء الدور بنجاح");
            setMode("edit");
            setSelectedRoleId(data.record.id);
          },
        }
      );
    } else if (mode === "edit" && selectedRoleId) {
      updateRoleMutation.mutate(
        {
          id: selectedRoleId,
          payload: {
            title: titleToSave,
            name: titleToSave,
            permissions: selectedPermissions,
          },
        },
        {
          onSuccess: () => {
            toast.success("تم حفظ التغييرات بنجاح");
          },
        }
      );
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      setRoleName("");
      setRoleTitle("");
      setSelectedPermissions([]);
    } else if (roleDetailsData?.record) {
      const role = roleDetailsData.record;
      setRoleName(role.name || "");
      setRoleTitle(role.title || "");
      setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between h-16 px-6">
          <nav className="flex items-center h-full">
            <ul className="flex items-center gap-8 h-full">
              <li className="h-full flex items-center">
                <Link
                  href="/admin/users"
                  className="text-sm font-semibold text-gray-500 hover:text-[#3A5779] h-full flex items-center transition-colors"
                >
                  الحسابات
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link
                  href="/admin/permissions"
                  className="text-sm font-semibold text-[#3A5779] border-b-2 border-[#3A5779] h-full flex items-center transition-colors"
                >
                  الادوار والصلاحيات
                </Link>
              </li>
            </ul>
          </nav>

          <Button
            onClick={handleAddNewRole}
            className="flex items-center gap-2 px-4 py-2 bg-blue-3 rounded text-white text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            دور وظيفي جديد
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <SidebarFilterPanel
              options={filterCategories}
              activeFilter={selectedRoleId ? String(selectedRoleId) : ""}
              onFilterChange={handleRoleSelect}
            />
          </div>

          <div className="col-span-12 lg:col-span-9">
            {!selectedRoleId && mode === "edit" ? (
              <div className="bg-white rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">
                  الرجاء اختيار دور وظيفي من القائمة أو إضافة دور جديد
                </p>
              </div>
            ) : isLoadingRole && mode === "edit" ? (
              <div className="bg-white rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-blue-4">
                      {mode === "create"
                        ? "إضافة دور وظيفي جديد"
                        : "معلومات الدور الوظيفي"}
                    </h2>
                  </div>

                  <div className="">
                    <FormInput
                      label="اسم الدور الوظيفي"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="ادخل اسم الدور الوظيفي"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg text-blue-4 font-semibold">
                      صلاحية الموظف
                    </h3>

                    <div className="space-y-3">
                      {allPermissions.map((permission) => {
                        const isChecked = selectedPermissions.includes(
                          permission.id
                        );

                        return (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between py-2"
                          >
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  handlePermissionToggle(permission.id)
                                }
                                className="w-4 h-4 text-blue-3 cursor-pointer accent-blue-3"
                              />
                              <span className="text-sm text-gray-700">
                                {permission.title}
                              </span>
                            </label>

                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:bg-gray-50 cursor-pointer opacity-50"
                              disabled
                            >
                              +
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mt-6">
                  <div className="flex gap-4 justify-center">
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={isMutating}
                      className="px-8 py-3 cursor-pointer rounded-sm"
                      style={{ backgroundColor: "var(--blue-4)" }}
                    >
                      {isMutating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الحفظ...
                        </span>
                      ) : (
                        "حفظ التغييرات"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isMutating}
                      className="px-8 py-3 cursor-pointer text-blue-4 rounded-sm"
                      style={{ backgroundColor: "var(--blue-5)" }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}