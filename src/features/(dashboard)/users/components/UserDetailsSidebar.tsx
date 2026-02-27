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
import { FormInput } from "@/src/components/ui/FormInput";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown"; // استخدام ReusableDropdown
import {
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { cn } from "@/src/lib/utils";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { UserUpdatePayload } from "../api";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";

interface UserDetailsSidebarProps {
  selectedUserId: number | null;
  onUserUpdate: () => void;
  onUserDelete: () => void;
  className?: string;
}

interface MediaItem {
  file_name: string;
  src: string;
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

const ImageActionMenu = ({
  onClose,
  onChange,
  onDelete,
}: {
  onClose: () => void;
  onChange: () => void;
  onDelete: () => void;
}) => (
  <div
    className="absolute top-1/2 start-full z-20 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden text-sm"
    style={{ transform: "translate(8px, -50%)" }}
  >
    <button
      onClick={() => {
        onChange();
        onClose();
      }}
      className="flex items-center gap-3 w-full px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="bg-blue-1 p-1 rounded">
        <img src="/icons/dashboard/edit3.svg" className="w-4 h-4 text-blue-4" alt="edit" />
      </div>
      تغيير الصورة
    </button>
    <button
      onClick={() => {
        onDelete();
        onClose();
      }}
      className="flex items-center gap-3 w-full px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="bg-red-2 p-1 rounded">
        <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="delete" />
      </div>
      حذف الصورة
    </button>
  </div>
);

export function UserDetailsSidebar({
  selectedUserId,
  onUserUpdate,
  onUserDelete,
  className,
}: UserDetailsSidebarProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [countryCode, setCountryCode] = useState("+972");

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showMediaCenter, setShowMediaCenter] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newAvatarFileName, setNewAvatarFileName] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch,
  } = useGetSingleUser(selectedUserId || undefined, {
    enabled: !isDeleteConfirmed,
  });

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles(new URLSearchParams());

  const dynamicRoleOptions = useMemo(() => {
    const baseOptions: { value: string; label: string }[] = [];

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
  const selectedRole = watch("roles");
  const phoneValue = watch("phone");

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
      setNewAvatarFileName(user.avatar);
      setCurrentAvatarUrl(user.avatar_url || null);
    } else {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        roles: "",
        is_active: true,
      });
      setNewAvatarFileName(null);
      setCurrentAvatarUrl(null);
    }
  }, [userData, reset]);

  const handleMediaSelect = (file: MediaItem | MediaItem[]) => {
    let selectedFile: MediaItem;

    if (Array.isArray(file)) {
      selectedFile = file[0];
    } else {
      selectedFile = file;
    }

    setNewAvatarFileName(selectedFile.file_name);
    setCurrentAvatarUrl(selectedFile.src);
    setShowMediaCenter(false);
  };

  const handleImageDelete = () => {
    setNewAvatarFileName(null);
    setCurrentAvatarUrl(null);
    setShowActionMenu(false);
  };

  const onSubmit = (data: UserFormData) => {
    if (!selectedUserId || !userData?.record) return;

    const originalUser = userData.record;

    const payload: UserUpdatePayload = {
      avatar: newAvatarFileName,
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

  useEffect(() => {
    setIsDeleteConfirmed(false);
  }, [selectedUserId]);

  const handleDelete = () => {
    if (!selectedUserId) return;

    setIsDeleteConfirmed(true);

    deleteUserMutation.mutate(selectedUserId, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSuccessModalOpen(true);
        setIsDeleteConfirmed(false);
      },
      onError: () => {
        setIsDeleteConfirmed(false);
      }
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
        <Loader2 className="w-6 h-6 animate-spin text-gray-2" />
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
        <p className="text-sm text-gray-2">
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

  const avatarUrl = currentAvatarUrl || "https://aatene.dev/main/user.png";

  return (
    <div className={cn("space-y-4 max-h-[calc(100vh-193px)] overflow-y-auto", className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">

          {/* --- Profile Picture Area --- */}
          <div className="flex flex-col gap-4 mb-6">
            <h3 className="text-lg font-medium text-blue-4">
              بيانات المستخدم
            </h3>

            <div className="relative w-fit">
              <p className="text-sm font-medium mb-2">الصورة الشخصية</p>
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-32 h-32 rounded-full object-cover border-1 border-gray-50 cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />

              <button
                type="button"
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="absolute bottom-0 end-1 p-1.5 rounded-full bg-blue-3 border border-white shadow-sm text-white hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="تغيير الصورة"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {showActionMenu && (
                <ImageActionMenu
                  onClose={() => setShowActionMenu(false)}
                  onChange={() => setShowMediaCenter(true)}
                  onDelete={handleImageDelete}
                />
              )}
            </div>
          </div>

          {/* --- Form Fields --- */}
          <div className="space-y-4">

            <FormInput
              label="الاسم الأول"
              placeholder="الاسم الأول"
              {...register("first_name")}
              error={errors.first_name?.message}
              required
            />

            <FormInput
              label="الاسم الأخير"
              placeholder="الاسم الأخير"
              {...register("last_name")}
              error={errors.last_name?.message}
              required
            />

            {/* تم استبدال FormSelect بـ ReusableDropdown مع Label مخصص */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">الدور <span className="text-red-500">*</span></label>
              <ReusableDropdown
                options={dynamicRoleOptions}
                value={selectedRole}
                onChange={(val) => setValue("roles", val, { shouldValidate: true })}
                placeholder={isLoadingRoles ? "جاري التحميل..." : "اختر الدور"}
                error={errors.roles?.message}
                className="h-[46px]" // تعديل الطول ليتناسب مع FormInput
              />
            </div>

            <FormInput
              label="البريد الالكتروني"
              type="email"
              placeholder="example@gmail.com"
              {...register("email")}
              error={errors.email?.message}
              required
            />

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

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-sm font-medium">
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
                className="px-6 bg-blue-6 text-blue-4 cursor-pointer rounded-xs"
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
                className="px-6 rounded-xs bg-red-2 text-red-1 border-0 cursor-pointer"
              >
                {deleteUserMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <img src="/icons/dashboard/trash.svg" className="w-4 h-4" />
                )}
                حذف المستخدم
              </Button>
            </div>
          </div>
        </div>

        {/* --- User Info Card (Read Only) --- */}
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

      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-hidden p-0 gap-0" dir="rtl">
          <DialogHeader className="p-4">
            <DialogTitle className="text-xl font-medium">
              صورة المستخدم
            </DialogTitle>
          </DialogHeader>
          <div className="p-3 flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={fullName}
              className="max-w-full max-h-[70vh] object-contain rounded-sm"
            />
          </div>
        </DialogContent>
      </Dialog>

      {showMediaCenter && (
        <MediaCenterModal
          open={showMediaCenter}
          onOpenChange={() => setShowMediaCenter(false)}
          onSelect={handleMediaSelect}
          multiple={false}
          allowedMediaTypes={["avatar", "image"]}
          selectionLimit={1}
        />
      )}

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          onUserDelete();
        }}
        title="تم حذف المستخدم بنجاح"
        message="تم حذف بيانات المستخدم بنجاح"
      />
    </div>
  );
}