// src/features/(dashboard)/stores/components/AddStoreStep4.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { StoreFormActions } from "./StoreFormActions";
import { StoreType, StoreManager, StoreStatus } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { Step2FormData, Step4FormData } from "../types";

interface AddStoreStep4Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step4FormData;
  onNext: (data: Step4FormData) => void;
  onBack: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
}

interface NewManagerForm {
  name: string;
  email: string;
  title: string;
  status: StoreStatus;
}

export function AddStoreStep4({
  storeType,
  previousData,
  initialData,
  onNext,
  onBack,
  barSteps
}: AddStoreStep4Props) {
  const [activeTab, setActiveTab] = useState<"list" | "add">("add");
  const [managers, setManagers] = useState<StoreManager[]>(
    initialData?.managers || []
  );

  // حالة لتتبع الموظف الذي يتم تعديله حالياً (-1 يعني إضافة جديد)
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const [newManager, setNewManager] = useState<NewManagerForm>({
    name: "",
    email: "",
    title: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = barSteps;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const jobTitleOptions = [
    { value: "general", label: "مدير عام" },
    { value: "sales", label: "مدير مبيعات" },
    { value: "products", label: "مسؤول طلبات" },
    { value: "services", label: "مدير خدمات" },
  ];

  const statusOptions = [
    { value: "active", label: "نشط" },
    { value: "not-active", label: "غير نشط" },
  ];

  const validateManager = () => {
    const newErrors: Record<string, string> = {};

    if (!newManager.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(newManager.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }

    if (!newManager.title) {
      newErrors.title = "الدور الوظيفي مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveManager = () => {
    if (validateManager()) {
      const managerData: StoreManager = {
        user_email: newManager.email,
        title: newManager.title,
        status: newManager.status,
        user_name: newManager.name,
      };

      if (editingIndex >= 0) {
        // تحديث موظف موجود
        const updatedManagers = [...managers];
        updatedManagers[editingIndex] = managerData;
        setManagers(updatedManagers);
      } else {
        // إضافة موظف جديد
        setManagers([...managers, managerData]);
      }

      // إعادة تعيين النموذج
      setNewManager({
        name: "",
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
      name: managerToEdit.user_name || "",
      email: managerToEdit?.user_email || "",
      title: managerToEdit.title,
      status: managerToEdit.status,
    });
    setEditingIndex(index);
    setActiveTab("add");
    // مسح الأخطاء السابقة عند فتح التعديل
    setErrors({});
  };

  const handleNext = () => {
    onNext({ managers });
  };

  const handleCancelAdd = () => {
    setNewManager({
      name: "",
      email: "",
      title: "",
      status: "active",
    });
    setEditingIndex(-1);
    setErrors({});
    setActiveTab("list");
  };

  return (
    <div className=" bg-gray-50">
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
                    "flex-1 py-3 text-sm font-bold transition-colors",
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
                    // عند الضغط يدوياً على التاب، نعتبرها إضافة جديدة ونصفر التعديل
                    if (activeTab !== "add") {
                       setNewManager({
                          name: "",
                          email: "",
                          title: "",
                          status: "active",
                       });
                       setEditingIndex(-1);
                       setErrors({});
                    }
                  }}
                  className={cn(
                    "flex-1 py-3 text-sm font-bold transition-colors border-s border-gray-300",
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
                  <FormInput
                    label="اسم الموظف"
                    placeholder="إدخل اسم الموظف"
                    value={newManager.name}
                    onChange={(e) =>
                      setNewManager({ ...newManager, name: e.target.value })
                    }
                  />

                  <FormInput
                    label="البريد الالكتروني"
                    type="email"
                    value={newManager.email}
                    onChange={(e) =>
                      setNewManager({ ...newManager, email: e.target.value })
                    }
                    placeholder="kerooadel5@gmail.com"
                    error={errors.email}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900">
                      الدور الوظيفي
                    </Label>
                    <ReusableDropdown
                      options={jobTitleOptions}
                      value={newManager.title}
                      onChange={(value) =>
                        setNewManager({ ...newManager, title: value })
                      }
                      placeholder="مسؤول طلبات"
                      className="w-full"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900">
                      حالة الموظف
                    </Label>
                    <ReusableDropdown
                      options={statusOptions}
                      value={newManager.status}
                      onChange={(value) =>
                        setNewManager({
                          ...newManager,
                          status: value as StoreStatus,
                        })
                      }
                      placeholder="اختر الحالة"
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-4 justify-between pt-4">
                    <Button
                      onClick={handleCancelAdd}
                      variant="outline"
                      className="px-6 py-2 bg-white  border border-gray-300 hover:bg-gray-50 cursor-pointer rounded-sm h-10"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleSaveManager}
                      className="px-6 py-2 cursor-pointer rounded-sm text-white h-10"
                      style={{ backgroundColor: "#3A5779" }}
                    >
                      {editingIndex >= 0 ? "حفظ التعديلات" : "ارسال دعوة"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-[#F5F9FC] text-blue-4 font-medium">
                        <tr>
                          <th className="p-4 text-start">اسم الموظف</th>
                          <th className="p-4 text-start">الايميل</th>
                          <th className="p-4 text-center">حاله الموظف</th>
                          <th className="p-4 text-start">الاجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {managers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                              لا يوجد موظفين مضافين
                            </td>
                          </tr>
                        ) : (
                          managers.map((manager, index) => {
                            const displayName =
                              manager.user_name || "اسم غير متوفر";

                            return (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 text-blue-4"
                              >
                                <td className="p-4 font-medium ">{displayName}</td>
                                <td className="p-4 ">{manager.user_email}</td>
                                <td className="p-4">
                                  <div className="">
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
          </div>
        </div>
      </div>

      <StoreFormActions onNext={handleNext} onBack={onBack} />
    </div>
  );
}