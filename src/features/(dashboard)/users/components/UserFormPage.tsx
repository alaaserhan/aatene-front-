// src/features/(dashboard)/users/components/UserFormPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { FormInput } from "@/src/components/ui/FormInput";
import { Button } from "@/src/components/ui/button";
import { useCreateUser } from "../hooks";
import { useGetRoles, useGetSingleRole } from "../../roles/hooks";
import { Loader2 } from "lucide-react";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { UserCreatePayload } from "../api";
import { MediaSelectButton } from "../../mediaCenter/components/MediaSelectButton";
import { Permission } from "../../permissions/api";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

const userFormSchema = z.object({
  avatar: z.string().nullable(),
  avatar_preview: z.string().nullable(),
  first_name: z.string().min(1, "الاسم الأول مطلوب"),
  last_name: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح").min(1, "البريد مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  gender: z.enum(["male", "female"]),
  is_active: z.boolean(),
  roles: z.string().min(1, "الدور الوظيفي مطلوب"),
});

type UserFormData = z.infer<typeof userFormSchema>;

export function UserFormPage() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+20");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: rolesData } = useGetRoles(new URLSearchParams());
  const roles = rolesData?.data || [];
  const roleOptions = roles.map((role) => ({
    value: role.id.toString(),
    label: role.title || role.name,
  }));
  const createUserMutation = useCreateUser();
  const isMutating = createUserMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      avatar: null,
      avatar_preview: null,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      gender: "male",
      is_active: true,
      roles: "",
    },
  });

  const selectedRoleId = watch("roles");
  const avatarPreview = watch("avatar_preview");
  const isActive = watch("is_active");
  const gender = watch("gender");
  const phoneValue = watch("phone"); // [تعديل هام] مراقبة قيمة الهاتف لتفعيل التحقق

  const { data: roleDetailsData } = useGetSingleRole(
    selectedRoleId ? Number(selectedRoleId) : undefined
  );

  const onSubmit = (data: UserFormData) => {
    const payload: UserCreatePayload = {
      ...data,
      phone: `${countryCode}${data.phone}`,
      is_active: data.is_active ? "1" : "0",
      roles: data.roles ? [Number(data.roles)] : [],
    };
    createUserMutation.mutate(payload, {
      onSuccess: () => {
        setShowSuccessModal(true);
      },
    });
  };

  const handleCancel = () => {
    router.push("/admin/users");
  };

  const breadcrumbItems = [
    { label: "إدارة العملاء", href: "/admin/users" },
    { label: "عميل جديد" },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb items={breadcrumbItems} className="" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-sm  p-4  mt-4">
            <h1 className="text-xl font-bold text-blue-4 mb-6 ">
              المعلومات الأساسية
            </h1>

            <div className="space-y-6">
              <MediaSelectButton
                label="الصورة الشخصية"
                width={150}
                height={150}
                value={watch("avatar")}
                previewUrl={avatarPreview}
                onChange={(fileName, src) => {
                  setValue("avatar", fileName, { shouldValidate: true });
                  setValue("avatar_preview", src);
                }}
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                primaryText="إضافة صورة شخصية"
                infoText={[]}
                allowedMediaTypes={["avatar"]}
              />

              <FormInput
                label="الاسم الأول"
                {...register("first_name")}
                placeholder="اكتب الاسم الاول"
                error={errors.first_name?.message}
                required
              />

              <FormInput
                label="الاسم الأخير"
                {...register("last_name")}
                placeholder="اكتب الاسم الاخير"
                error={errors.last_name?.message}
                required
              />

              {/* [تعديل] Custom Radio Button Design */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">الجنس <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6">
                  {/* خيار أنثى */}
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <input
                      type="radio"
                      value="female"
                      {...register("gender")}
                      className="sr-only" // إخفاء العنصر الأصلي
                    />
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                        gender === "female"
                          ? "bg-blue-5 border-blue-4" // نفس ألوان الـ Checkbox المخصص
                          : "bg-white border-gray-300 group-hover:border-gray-2"
                      )}
                    >
                      {gender === "female" && (
                        <div className="w-2 h-2 rounded-full bg-blue-4" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">أنثى</span>
                  </label>

                  {/* خيار ذكر */}
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <input
                      type="radio"
                      value="male"
                      {...register("gender")}
                      className="sr-only" // إخفاء العنصر الأصلي
                    />
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                        gender === "male"
                          ? "bg-blue-5 border-blue-4" // نفس ألوان الـ Checkbox المخصص
                          : "bg-white border-gray-300 group-hover:border-gray-2"
                      )}
                    >
                      {gender === "male" && (
                        <div className="w-2 h-2 rounded-full bg-blue-4" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">ذكر</span>
                  </label>
                </div>
              </div>

              <FormInput
                label="البريد الإلكتروني"
                type="email"
                {...register("email")}
                placeholder="example@gmail.com"
                error={errors.email?.message}
                required
              />

              {/* [تعديل] تمرير value لتفعيل التحقق من الأخطاء */}
              <PhoneNumberInput
                label="رقم الهاتف"
                placeholder="0000000000"
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                {...register("phone")}
                value={phoneValue}
                error={errors.phone?.message}
                required
              />

              <div className="flex flex-col gap-3">
                <label className="block text-sm font-medium">
                  تفعيل الحساب
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-2">غير مفعل</span>
                  <ToggleSwitch
                    enabled={isActive}
                    onChange={(checked) => setValue("is_active", checked)}
                  />
                  <span className="text-sm text-gray-2">مفعل</span>
                </div>
              </div>

              <Controller
                control={control}
                name="roles"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      الدور الوظيفي <span className="text-red-500">*</span>
                    </label>
                    <ReusableDropdown
                      options={roleOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      placeholder="اختر الدور الوظيفي"
                      error={errors.roles?.message}
                      className="w-full"
                      dropdownPosition="top"
                    />
                  </div>
                )}
              />

              {roleDetailsData?.record && (
                <PermissionsPreview
                  permissions={roleDetailsData.record.permissions}
                />
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-between p-4 bg-white rounded-sm my-4">
            <Button
              type="submit"
              disabled={isMutating}
              className="px-8 py-3 cursor-pointer rounded-sm"
              style={{ backgroundColor: "var(--blue-3)" }}
            >
              {isMutating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الإنشاء...
                </span>
              ) : (
                "إنشاء مستخدم"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-8 py-3 cursor-pointer rounded-sm shadow-none"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/admin/users");
        }}
        title="تم إنشاء العميل بنجاح"
        message="تم إنشاء حساب العميل بنجاح"
      />
    </div>
  );
}

interface PermissionsPreviewProps {
  permissions: Permission[];
}

function PermissionsPreview({ permissions }: PermissionsPreviewProps) {
  return (
    <div className="space-y-4">
      <h2 className=" font-semibold text-sm ">معاينة الصلاحيات</h2>

      {permissions.length === 0 ? (
        <p className="text-sm text-gray-2">لا يوجد صلاحيات</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {permissions.map((per, index) => (
            <Badge
              key={index}
              variant="outline"
              className="px-4 py-2 text-sm bg-blue-5 text-blue-3 border-none"
            >
              {per.title}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}