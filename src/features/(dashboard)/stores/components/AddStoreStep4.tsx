// src/features/(dashboard)/stores/components/AddStoreStep4.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { StoreFormActions } from "./StoreFormActions";
import { StoreType, StoreManagerPayload, StoreStatus, ManagerTitle } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { Step2FormData, Step4FormData } from "../types";
import { useGetUsers, useCheckEmail } from "../../users/hooks";


import { toast } from "sonner";
import { useAuthStore } from "@/src/stores/auth-store";
import { Input } from "@/src/components/ui/input";

interface AddStoreStep4Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step4FormData;
  onNext: (data: Step4FormData) => void;
  onBack: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
}

interface NewManagerForm {
  email: string;
  title: ManagerTitle | "";
  status: StoreStatus;
}

const JOB_TITLE_OPTIONS = [
  { value: "general", label: "مدير عام" },
  { value: "sales", label: "مدير مبيعات" },
  { value: "social", label: "مدير سوشيال" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "نشط" },
  { value: "not-active", label: "غير نشط" },
];

export function AddStoreStep4({
  storeType,
  previousData,
  initialData,
  onNext,
  onBack,
  barSteps,
}: AddStoreStep4Props) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.user_type === "admin";

  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [managers, setManagers] = useState<StoreManagerPayload[]>(
    initialData?.managers || []
  );

  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const [newManager, setNewManager] = useState<NewManagerForm>({
    email: "",
    title: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutateAsync: checkEmail, isPending: isCheckingEmail } = useCheckEmail();

  const { data: usersData, isLoading: isUsersLoading } = useGetUsers(
    new URLSearchParams("per_page=1000"),
    { enabled: isAdmin }
  );


  const userOptions = usersData?.data
    ? usersData.data.map((user) => ({
      label: `${user.first_name} ${user.last_name} (${user.email})`,
      value: user.email,
    }))
    : [];

  const dropdownOptions = [
    { value: "", label: isUsersLoading ? "جاري التحميل..." : "اختر الموظف" },
    ...userOptions,
  ];

  const steps = barSteps;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const validateManager = () => {
    const newErrors: Record<string, string> = {};

    if (!newManager.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newManager.email)) {
        newErrors.email = "البريد الإلكتروني غير صالح (يجب أن يكون باللغة الإنجليزية)";
      }
    }

    if (!newManager.title) {
      newErrors.title = "الدور الوظيفي مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveManager = async () => {
    if (validateManager()) {
      if (!isAdmin) {
        try {
          const res = await checkEmail({ email: newManager.email });
          if (!res.status) {
            setErrors({ email: "هذا البريد الإلكتروني غير موجود في النظام" });
            return;
          }
        } catch {
          return;
        }

      }

      const managerData: StoreManagerPayload = {
        email: newManager.email,
        title: newManager.title as ManagerTitle,
        status: newManager.status,
      };

      if (editingIndex >= 0) {
        const updatedManagers = [...managers];
        updatedManagers[editingIndex] = managerData;
        setManagers(updatedManagers);
      } else {
        setManagers([...managers, managerData]);
      }

      setNewManager({
        email: "",
        title: "",
        status: "active",
      });
      setEditingIndex(-1);
      setActiveTab("list");
      setErrors({});
    }
  };


  const handleRemoveManager = (index: number) => {
    setManagers(managers.filter((_, i) => i !== index));
  };

  const handleEditManager = (index: number) => {
    const managerToEdit = managers[index];
    setNewManager({
      email: managerToEdit.email,
      title: managerToEdit.title,
      status: managerToEdit.status,
    });
    setEditingIndex(index);
    setActiveTab("add");
    setErrors({});
  };

  const handleNext = () => {
    if (activeTab === "add" && (newManager.email || newManager.title)) {
      if (validateManager()) {
        const managerData: StoreManagerPayload = {
          email: newManager.email,
          title: newManager.title as ManagerTitle,
          status: newManager.status,
        };

        let updatedManagers = [...managers];

        if (editingIndex >= 0) {
          updatedManagers[editingIndex] = managerData;
        } else {
          updatedManagers = [...updatedManagers, managerData];
        }

        onNext({ managers: updatedManagers });
      } else {
        toast.error("يرجى حفظ بيانات الموظف بشكل صحيح قبل المتابعة");
      }
    } else {
      onNext({ managers });
    }
  };

  const handleCancelAdd = () => {
    setNewManager({
      email: "",
      title: "",
      status: "active",
    });
    setEditingIndex(-1);
    setErrors({});
    setActiveTab("list");
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <StepperProgress currentStep={3} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">موظفين المتجر</h2>

              <div className="flex w-full border border-gray-300 rounded overflow-hidden mb-8">
                <button
                  onClick={() => setActiveTab("list")}
                  className={cn(
                    "flex-1 py-3 text-sm font-bold transition-colors cursor-pointer",
                    activeTab === "list"
                      ? "bg-blue-5 text-blue-4"
                      : "bg-white text-gray-2 hover:bg-gray-50"
                  )}
                >
                  جدول الموظفين
                </button>
                <button
                  onClick={() => {
                    setActiveTab("add");
                    if (activeTab !== "add") {
                      setNewManager({
                        email: "",
                        title: "",
                        status: "active",
                      });
                      setEditingIndex(-1);
                      setErrors({});
                    }
                  }}
                  className={cn(
                    "flex-1 py-3 text-sm font-bold transition-colors border-s border-gray-300 cursor-pointer",
                    activeTab === "add"
                      ? "bg-blue-5 text-blue-4"
                      : "bg-white text-gray-2 hover:bg-gray-50"
                  )}
                >
                  {editingIndex >= 0 ? "تعديل بيانات الموظف" : "اضافة الموظفين"}
                </button>
              </div>

              {activeTab === "add" ? (
                <div className="space-y-6 p-3 border border-gray-200 rounded-lg">

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ">
                      {isAdmin ? "اختر الموظف" : "البريد الإلكتروني"} <span className="text-red-500">*</span>
                    </Label>
                    {isAdmin ? (
                      <ReusableDropdown
                        options={dropdownOptions}
                        value={newManager.email}
                        onChange={(value) => {
                          setNewManager((prev) => ({ ...prev, email: value }));
                          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder={isUsersLoading ? "جاري التحميل..." : "ابحث بالاسم أو البريد"}
                        className="w-full"
                        error={errors.email}
                        dropdownPosition="bottom"
                      />
                    ) : (
                      <Input
                        type="email"
                        value={newManager.email}
                        onChange={(e) => {
                          setNewManager((prev) => ({ ...prev, email: e.target.value }));
                          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder="example@info.com"
                        className={cn(
                          "w-full h-11 bg-white border-gray-200 focus-visible:ring-blue-300",
                          errors.email && "border-red-500"
                        )}
                      />
                    )}
                    {errors.email && !isAdmin && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ">
                      الدور الوظيفي <span className="text-red-500">*</span>
                    </Label>
                    <ReusableDropdown
                      options={JOB_TITLE_OPTIONS}
                      value={newManager.title}
                      onChange={(value) =>
                        setNewManager((prev) => ({ ...prev, title: value as ManagerTitle }))
                      }
                      placeholder="مسؤول طلبات"
                      className="w-full"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ">
                      حالة الموظف
                    </Label>
                    <ReusableDropdown
                      options={STATUS_OPTIONS}
                      value={newManager.status}
                      onChange={(value) =>
                        setNewManager((prev) => ({
                          ...prev,
                          status: value as StoreStatus,
                        }))
                      }
                      placeholder="اختر الحالة"
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-4 justify-between pt-4">
                    <Button
                      onClick={handleCancelAdd}
                      variant="outline"
                      className="px-6 py-2 bg-white border border-gray-200 shadow-none cursor-pointer rounded-sm h-10"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleSaveManager}
                      disabled={isCheckingEmail}
                      className="px-6 py-2 cursor-pointer rounded-sm text-white h-10 min-w-[120px]"
                      style={{ backgroundColor: "#3A5779" }}
                    >
                      {isCheckingEmail ? "جاري التحقق..." : (editingIndex >= 0 ? "حفظ التعديلات" : "ارسال دعوة")}
                    </Button>

                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-[#F5F9FC] text-blue-4 font-medium">
                        <tr>
                          <th className="p-4 text-start">الايميل</th>
                          <th className="p-4 text-center">حاله الموظف</th>
                          <th className="p-4 text-start">الاجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {managers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-2">
                              لا يوجد موظفين مضافين
                            </td>
                          </tr>
                        ) : (
                          managers.map((manager, index) => {
                            const jobLabel =
                              JOB_TITLE_OPTIONS.find(
                                (opt) => opt.value === manager.title
                              )?.label || manager.title;

                            return (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 text-blue-4"
                              >
                                <td className="p-4 font-medium">{manager.email}</td>
                                <td className="p-4">
                                  <div className="flex justify-center">
                                    <span
                                      className={cn(
                                        "px-6 py-1 rounded-full text-xs font-medium",
                                        manager.status === "active"
                                          ? "bg-green-100 text-green-600"
                                          : "bg-red-100 text-red-600"
                                      )}
                                    >
                                      {manager.status === "active"
                                        ? "مفعل"
                                        : "غير مفعل"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditManager(index)}
                                      className="p-2 bg-[#3A57791A] hover:bg-blue-100 rounded text-[#3A5779] transition-colors cursor-pointer"
                                      title="تعديل"
                                    >
                                      <img
                                        src="/icons/dashboard/edit.svg"
                                        className="w-4 h-4"
                                        alt=""
                                      />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveManager(index)}
                                      className="p-2 bg-[#FB37481A] hover:bg-red-100 rounded text-[#FB3748] transition-colors cursor-pointer"
                                      title="حذف"
                                    >
                                      <img
                                        src="/icons/dashboard/trash.svg"
                                        className="w-4 h-4"
                                        alt=""
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <StorePreviewSidebar
              data={{
                logo: previousData.logo_preview,
                name: previousData.name,
                description: previousData.description,
                coverImages: previousData.cover_previews,
              }}
            />
            <GuideVideoCard location="create-store" />
          </div>
        </div>
      </div>

      <StoreFormActions onNext={handleNext} onBack={onBack} />
    </div>
  );
}