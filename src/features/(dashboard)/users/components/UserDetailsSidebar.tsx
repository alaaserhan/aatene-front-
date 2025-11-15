// src/features/(dashboard)/users/components/UserDetailsSidebar.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetSingleUser,
  useUpdateUser,
  useDeleteUser,
} from "../hooks";
import { useGetRoles } from "../../roles/hooks";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Loader2,
  Trash2,
  Mail,
  Phone as PhoneIcon,
  MessageCircle,
} from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { cn } from "@/src/lib/utils";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { UserUpdatePayload } from "../api";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";

interface UserDetailsSidebarProps {
  selectedUserId: number | null;
  onUserUpdate: () => void;
  onUserDelete: () => void;
  className?: string;
}

const userSchema = z.object({
  first_name: z.string().min(1, "الاسم الأول مطلوب"),
  last_name: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  roles: z.string().optional(),
  is_active: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserDetailsSidebar({
  selectedUserId,
  onUserUpdate,
  onUserDelete,
  className,
}: UserDetailsSidebarProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("+20");

  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch,
  } = useGetSingleUser(selectedUserId);

  const { data: rolesData } = useGetRoles(new URLSearchParams());

  const dynamicRoleOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "مستخدم " }];

    if (!rolesData?.data) {
      return baseOptions;
    }

    const fetchedRoles = rolesData.data.map((role) => ({
      value: String(role.id),
      label: role.name,
    }));

    return [...baseOptions, ...fetchedRoles];
  }, [rolesData]);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      roles: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (selectedUserId) {
      refetch();
    }
  }, [selectedUserId, refetch]);

  useEffect(() => {
    if (userData?.record) {
      const user = userData.record;
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        roles: user.roles?.[0]?.id ? String(user.roles[0].id) : "",
        is_active: user.is_active === "1" || user.is_active === true,
      });
    } else {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        roles: "",
        is_active: true,
      });
    }
  }, [userData, reset]);

  const onSubmit = (data: UserFormData) => {
    if (!selectedUserId || !userData?.record) return;

    const originalUser = userData.record;

    const payload: UserUpdatePayload = {
      avatar: originalUser.avatar,
      date_of_birth: originalUser.date_of_birth,
      gender: originalUser.gender,
      referral_code: originalUser.referral_code,
      city_id: originalUser.city_id ? Number(originalUser.city_id) : undefined,
      district_id: originalUser.district_id
        ? Number(originalUser.district_id)
        : undefined,

      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      is_active: data.is_active ? "1" : "0",
      roles: data.roles ? [Number(data.roles)] : [],
    };

    updateUserMutation.mutate(
      {
        id: selectedUserId,
        payload: payload,
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
      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[500px]",
          className
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!selectedUserId) {
    return (
      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-[65vh]",
          className
        )}
      >
        <p className="text-sm text-gray-500">
          الرجاء تحديد مستخدم لعرض التفاصيل
        </p>
      </div>
    );
  }

  const user = userData?.record;
  if (!user) return null;

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const roleNames =
    user.roles?.map((r) => r.name).join(", ") || "مستخدم عادي";

  return (
    <div className={cn("space-y-4", className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-blue-4 mb-6">
            بيانات المستخدم
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium  mb-2">
                الاسم الأول
              </label>
              <Input
                {...register("first_name")}
                placeholder="الاسم الأول"
                className="w-full"
              />
              {errors.first_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium  mb-2">
                الاسم الأخير
              </label>
              <Input
                {...register("last_name")}
                placeholder="الاسم الأخير"
                className="w-full"
              />
              {errors.last_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium  mb-2">
                الدور
              </label>
              <select
                {...register("roles")}
                className="w-full h-10 px-3 pr-8 bg-white border border-gray-300 rounded-lg text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-[#3A5779] focus:border-transparent"
              >
                {dynamicRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.roles && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.roles.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium  mb-2">
                البريد الالكتروني
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="kerooadel5@gmail.com"
                className="w-full"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <PhoneNumberInput
              label="رقم الهاتف"
              placeholder="0128000000"
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              {...register("phone")}
              error={errors.phone?.message}
            />

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-sm font-medium ">
                تفعيل الحساب
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-2">
                  غير مفعل
                </span>
                <ToggleSwitch
                  enabled={isActive}
                  onChange={(checked) => setValue("is_active", checked)}
                />
                <span className="text-xs text-gray-2">مفعل</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="px-6 bg-blue-6  text-blue-4 cursor-pointer rounded-xs"
              >
                {updateUserMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                )}
                حفظ التعديلات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(true)}
                disabled={deleteUserMutation.isPending}
                className="px-6 rounded-xs  bg-[#FB37481A] border-red-200 text-red-600 hover:text-red-600 hover:bg-red-100 cursor-pointer"
              >
                {deleteUserMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <img src="/icons/dashboard/trash.svg" alt="" />
                )}
                حذف المستخدم
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-6">
          <h3 className="text-lg font-medium text-blue-4">
            معلومات المستخدم
          </h3>

          <div className="flex flex-row justify-between items-center ">
            <div className="flex flex-row gap-3 items-center">
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={fullName}
                className="w-22 h-22 rounded-full object-cover mb-3"
              />
              <div className="flex flex-col gap-2.5">
                <h4 className="text-base font-medium ">{fullName}</h4>
                <div className="flex gap-3">
                  <p className="text-sm text-gray-2 ">{user.phone}</p>
                  <div className="flex items-center  gap-3 ">
                    <button
                      type="button"
                      className=" cursor-pointer"
                      title="إرسال بريد"
                    >
                      <div
                        className="w-5 h-5 bg-blue-4"
                        style={{
                          maskImage: "url(/icons/dashboard/email.svg)",
                          maskSize: "contain",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                        }}
                      ></div>
                    </button>
                    <div
                      className="w-5 h-5 bg-blue-4"
                      style={{
                        maskImage: "url(/icons/dashboard/whatsapp.svg)",
                        maskSize: "contain",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                      }}
                    ></div>
                    <div
                      className="w-5 h-5 bg-blue-4"
                      style={{
                        maskImage: "url(/icons/dashboard/phone.svg)",
                        maskSize: "contain",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="mb-6 bg-blue-3  cursor-pointer"
            >
              أضف عملات ذهبية
            </Button>
          </div>

          <div className="text-sm flex flex-row gap-5">
            <div className="flex flex-col gap-1 ">
              <span className="text-gray-2">الدور الوظيفي</span>
              <span className="font-medium ">{roleNames}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-2">البريد الإلكتروني</span>
              <span className="font-medium ">{user.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-2">تاريخ الانضمام</span>
              <span className="font-medium ">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("ar-EG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="هل أنت متأكد من حذف المستخدم؟"
        description="سيتم حذف جميع بيانات المستخدم بشكل نهائي"
      />
    </div>
  );
}