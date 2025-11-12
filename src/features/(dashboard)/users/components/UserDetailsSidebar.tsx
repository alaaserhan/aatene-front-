// src/features/(dashboard)/users/components/UserDetailsSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetSingleUser,
  useUpdateUser,
  useDeleteUser,
} from "../hooks";
import { FormInput } from "@/src/components/ui/FormInput";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { Button } from "@/src/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

// (ملاحظة: هذا الكومبوننت غير موجود، سأستخدم FormInput العادي)
// import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput"; 

// (ملاحظة: هذا الكومبوننت غير موجود، سأستخدم Select عادي)
// import { MultiSelect } from "@/src/components/ui/MultiSelect"; 

interface UserDetailsSidebarProps {
  selectedUserId: number | null;
  onUserUpdate: () => void;
  onUserDelete: () => void;
}

const userSchema = z.object({
  first_name: z.string().min(1, "الاسم الأول مطلوب"),
  last_name: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  roles: z.array(z.number()).optional(), // (بناءً على API)
  is_active: z.boolean(),
  gender: z.string().optional(), // (بناءً على API)
});

type UserFormData = z.infer<typeof userSchema>;

export function UserDetailsSidebar({
  selectedUserId,
  onUserUpdate,
  onUserDelete,
}: UserDetailsSidebarProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    data: userData,
    isLoading: isLoadingUser,
    isError,
  } = useGetSingleUser(selectedUserId);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      roles: [],
      is_active: true,
      gender: "male",
    },
  });

  // تحميل بيانات المستخدم في الفورم
  useEffect(() => {
    if (userData?.record) {
      const user = userData.record;
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        roles: user.roles.map((r) => r.id),
        is_active: user.is_active === "1" || user.is_active === true,
        gender: user.gender,
      });
    }
  }, [userData, form]);

  const onSubmit = (data: UserFormData) => {
    if (!selectedUserId) return;

    updateUserMutation.mutate(
      {
        id: selectedUserId,
        payload: {
          ...data,
          is_active: data.is_active ? "1" : "0",
        },
      },
      {
        onSuccess: () => {
          onUserUpdate();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedUserId) return;
    deleteUserMutation.mutate(selectedUserId, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        onUserDelete();
      },
    });
  };

  if (isLoadingUser && selectedUserId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!selectedUserId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">الرجاء تحديد مستخدم لعرض التفاصيل</p>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: بيانات المستخدم */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-start">
            بيانات المستخدم
          </h3>
          <div className="space-y-4">
            <FormInput
              name="first_name"
              label="الاسم"
              placeholder="كيرلس عادل عزمي"
              className="text-start"
            />
            
            <FormInput
              name="roles"
              label="الدور"
              placeholder="مدير عام"
              className="text-start"
              // (ملاحظة: هذا يجب أن يكون Select/MultiSelect)
            />

            <FormInput
              name="email"
              label="البريد الالكتروني"
              type="email"
              placeholder="kerooadel5@gmail.com"
              className="text-start"
            />

            <FormInput
              name="phone"
              label="رقم الهاتف"
              type="tel"
              placeholder="+20 1289022985"
              className="text-start"
            />

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">تفعيل الحساب</label>
              <ToggleSwitch
                enabled={form.watch("is_active")}
                onChange={(enabled) => form.setValue("is_active", enabled)}
              />
            </div>
          </div>
        </div>

        {/* Card 2: معلومات المستخدم (ثابتة) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-6 text-start">
            معلومات المستخدم
          </h3>
          {/* (هنا يتم عرض البيانات الثابتة من التصميم) */}
           <div className="flex items-center gap-4">
            <img 
              src={userData?.record.avatar_url} 
              alt="avatar" 
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{userData?.record.first_name} {userData?.record.last_name}</p>
              <p className="text-sm text-gray-500">{userData?.record.phone}</p>
            </div>
            {/* (يمكن إضافة الأيقونات هنا) */}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="bg-[#3A5779] text-white hover:bg-opacity-90 cursor-pointer"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending && <Loader2 className="w-4 h-4 animate-spin me-2" />}
            حفظ التعديلات
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
            onClick={() => setDeleteModalOpen(true)}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin me-2" />
            ) : (
              <Trash2 className="w-4 h-4 me-2" />
            )}
            حذف المستخدم
          </Button>
        </div>
      </form>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="هل أنت متأكد من حذف المستخدم؟"
      />
    </FormProvider>
  );
}