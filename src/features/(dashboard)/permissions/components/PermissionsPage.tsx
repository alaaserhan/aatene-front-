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
import { Role, RoleListItem } from "../../roles/api";
import { Permission } from "../api";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { cn } from "@/src/lib/utils";

interface PermissionFormProps {
  role?: Role | null;
  allPermissions: Permission[];
  onSave: (payload: {
    title: string;
    name: string;
    permissions: number[];
  }) => void;
  onCancel: () => void;
  isMutating: boolean;
  mode: "edit" | "create";
}

function PermissionForm({
  role,
  allPermissions,
  onSave,
  onCancel,
  isMutating,
  mode,
}: PermissionFormProps) {
  const [roleTitleInput, setRoleTitleInput] = useState(role?.title || "");
  const [roleNameInput, setRoleNameInput] = useState(role?.name || "");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    role?.permissions?.map((p: Permission) => p.id) || []
  );

  // حالة لتخزين الأخطاء
  const [errors, setErrors] = useState<{ title?: string; name?: string }>({});

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const handleSaveClick = () => {
    const titleToSave = roleTitleInput.trim();
    const nameToSave = roleNameInput.trim();
    
    // إعادة تعيين الأخطاء
    const newErrors: { title?: string; name?: string } = {};
    let hasError = false;

    if (!titleToSave) {
      newErrors.title = "اسم الدور الوظيفي مطلوب";
      hasError = true;
    }
    
    if (!nameToSave) {
      newErrors.name = "الاسم البرمجي مطلوب";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // مسح الأخطاء عند النجاح
    setErrors({});

    onSave({
      title: titleToSave,
      name: nameToSave,
      permissions: selectedPermissions,
    });
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-4">
            {mode === "create"
              ? "إضافة دور وظيفي جديد"
              : "معلومات الدور الوظيفي"}
          </h2>
        </div>
        <div className="space-y-4">
          <FormInput
            label="اسم الدور الوظيفي"
            value={roleTitleInput}
            onChange={(e) => {
              setRoleTitleInput(e.target.value);
              // إخفاء الخطأ عند الكتابة
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="ادخل اسم الدور الوظيفي (مثال: مدير النظام)"
            error={errors.title} // تمرير رسالة الخطأ
          />

          <FormInput
            label="الاسم البرمجي"
            value={roleNameInput}
            onChange={(e) => {
              setRoleNameInput(e.target.value);
              // إخفاء الخطأ عند الكتابة
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="ادخل الاسم البرمجي (مثال: admin)"
            readOnly={mode === "edit"}
            disabled={mode === "edit"}
            className={cn(mode === "edit" && "bg-gray-100 text-gray-500")}
            error={errors.name} // تمرير رسالة الخطأ
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
              const isChecked = selectedPermissions.includes(permission.id);
              return (
                <div
                  key={permission.id}
                  className="flex items-center justify-between py-2"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                    onClick={() => handlePermissionToggle(permission.id)}
                  >
                    <button
                      type="button"
                      className={cn(
                        "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer pointer-events-none",
                        isChecked
                          ? "bg-blue-5 border-blue-4"
                          : "bg-white border-gray-300 group-hover:border-gray-500"
                      )}
                      aria-checked={isChecked}
                      role="checkbox"
                    >
                      {isChecked && (
                        <svg
                          className="w-4 h-4 text-blue-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <span className="text-sm text-gray-700">
                      {permission.title}
                    </span>
                  </div>
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
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={handleSaveClick}
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
            onClick={onCancel}
            disabled={isMutating}
            className="px-14 py-3 cursor-pointer text-blue-4 rounded-sm border-none shadow-none"
            style={{ backgroundColor: "var(--blue-5)" }}
          >
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PermissionsPage() {
  const [mode, setMode] = useState<"edit" | "create">("edit");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

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

  const filterCategories = useMemo(() => {
    return roles.map((role: RoleListItem) => ({
      name: role.title || "",
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

  const handleSave = (payload: {
    title: string;
    name: string;
    permissions: number[];
  }) => {
    if (mode === "create") {
      createRoleMutation.mutate(
        {
          name: payload.name,
          title: payload.title,
          permissions: payload.permissions,
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
            title: payload.title,
            name: payload.name,
            permissions: payload.permissions,
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
    if (mode === "create" && roles.length > 0) {
      setMode("edit");
      setSelectedRoleId(roles[0].id);
    } else if (mode === "create" && roles.length === 0) {
      // noop
    } else {
      setSelectedRoleId((prev) => prev);
    }
  };

  return (
    <div className="bg-gray-50  flex flex-col">
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
              activeValue={selectedRoleId ? String(selectedRoleId) : ""}
              onValueChange={handleRoleSelect}
              className="max-h-[calc(100vh-193px)]"
            />
          </div>

          <div className="col-span-12 lg:col-span-9 max-h-[calc(100vh-193px)]">
            {!selectedRoleId && mode === "edit" ? (
              <div className="bg-white rounded-lg p-8 flex items-center justify-center h-full ">
                <p className="text-gray-3">
                  الرجاء اختيار دور وظيفي من القائمة أو إضافة دور جديد
                </p>
              </div>
            ) : isLoadingRole && mode === "edit" ? (
              <div className="bg-white rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
              </div>
            ) : (
              <PermissionForm
                key={selectedRoleId || "create"}
                mode={mode}
                role={roleDetailsData?.record}
                allPermissions={allPermissions}
                onSave={handleSave}
                onCancel={handleCancel}
                isMutating={isMutating}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}