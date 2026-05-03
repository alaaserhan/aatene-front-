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
  User as UserIcon,
} from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { cn, isVideoFile } from "@/src/lib/utils";
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
  const [showCoverMediaCenter, setShowCoverMediaCenter] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newAvatarFileName, setNewAvatarFileName] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [newCoverFileName, setNewCoverFileName] = useState<string | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);

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
      label: role.title ?? role.name,
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
      setNewCoverFileName(user.cover || null);
      setCurrentCoverUrl(user.cover_url || null);
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
      setNewCoverFileName(null);
      setCurrentCoverUrl(null);
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

  const handleCoverSelect = (file: MediaItem | MediaItem[]) => {
    let selectedFile: MediaItem;
    if (Array.isArray(file)) selectedFile = file[0];
    else selectedFile = file;

    setNewCoverFileName(selectedFile.file_name);
    setCurrentCoverUrl(selectedFile.src);
    setShowCoverMediaCenter(false);
  };

  const handleImageDelete = () => {
    setNewAvatarFileName(null);
    setCurrentAvatarUrl(null);
    setShowActionMenu(false);
  };

  const handleCoverDelete = () => {
    setNewCoverFileName(null);
    setCurrentCoverUrl(null);
  };

  const onSubmit = (data: UserFormData) => {
    if (!selectedUserId || !userData?.record) return;

    const originalUser = userData.record;

    const payload: UserUpdatePayload = {
      avatar: newAvatarFileName,
      cover: newCoverFileName,
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

  const user = userData?.record;
  const whatsappUrl = useMemo(() => {
    if (!user?.phone) return "";
    return `https://wa.me/${user.phone.replace(/[^\d+]/g, "")}`;
  }, [user?.phone]);

  const handleWhatsAppClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
    }
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

  if (!user) return null;

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const roleNames =
    user.roles?.map((r) => r.name).join(", ") || "مستخدم عادي";

  const avatarUrl = currentAvatarUrl;

  return (
    <div className={cn("space-y-4 max-h-[calc(100vh-193px)] overflow-y-auto", className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">

          {/* --- Profile Picture & Cover Area --- */}
          <div className="flex flex-col gap-4 mb-6">
            <h3 className="text-lg font-medium text-blue-4">
              بيانات المستخدم
            </h3>

            {/* Cover Image Area */}
            <div className="relative w-full h-32 md:h-40 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 mt-2">
              {currentCoverUrl ? (
                isVideoFile(currentCoverUrl) ? (
                  <video
                    src={currentCoverUrl}
                    controls
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <img src={currentCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full bg-blue-5 flex items-center justify-center text-blue-4">
                  صورة الغلاف
                </div>
              )}
              <div className="absolute top-3 end-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoverMediaCenter(true)}
                  className="px-3 py-1.5 bg-white/90 rounded-md hover:bg-white shadow-sm flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="pt-0.5">  تغيير الغلاف</span>
                </button>
                {currentCoverUrl && (
                  <button
                    type="button"
                    onClick={handleCoverDelete}
                    className="p-1.5 bg-red-100/90 text-red-600 rounded-md hover:text-white shadow-sm flex items-center justify-center cursor-pointer transition-colors"
                    title="حذف الغلاف"
                  >
                    <img src="/icons/dashboard/trash.svg" alt="" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Avatar Image Area */}
            <div className="relative w-fit -mt-20 md:-mt-22 start-6 z-10 flex flex-col">
              <div className="relative w-fit bg-white p-1 rounded-full shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-0 border-white cursor-pointer bg-white"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center cursor-pointer"
                    onClick={() => setShowMediaCenter(true)}
                  >
                    <UserIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="absolute bottom-0 end-2 p-2 rounded-full bg-blue-3 border-2 border-white shadow-md text-white hover:bg-gray-50 hover:text-blue-3 transition-colors cursor-pointer"
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
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={fullName}
                  className="w-22 h-22 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-22 h-22 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                  <UserIcon className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-base font-medium ">{fullName}</h4>
                <div className="flex gap-3">
                  <p className="text-sm text-gray-2 ">{user.phone}</p>
                  <div className="flex items-center  gap-3 ">
                    <a
                      href={`mailto:${user.email}`}
                      className="cursor-pointer"
                      title="إرسال بريد الكتروني"
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
                    </a>
                    <button
                      type="button"
                      onClick={handleWhatsAppClick}
                      className="cursor-pointer"
                      title="واتساب"
                    >
                      <div
                        className="w-5 h-5 bg-blue-4"
                        style={{
                          maskImage: "url(/icons/dashboard/whatsapp.svg)",
                          maskSize: "contain",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                        }}
                      ></div>
                    </button>
                    <a
                      href={`tel:${user.phone}`}
                      className="cursor-pointer"
                      title="اتصال هاتفي"
                    >
                      <div
                        className="w-5 h-5 bg-blue-4"
                        style={{
                          maskImage: "url(/icons/dashboard/phone.svg)",
                          maskSize: "contain",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                        }}
                      ></div>
                    </a>
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
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="max-w-full max-h-[70vh] object-contain rounded-sm"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <UserIcon className="w-32 h-32 text-gray-300" />
              </div>
            )}
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

      {showCoverMediaCenter && (
        <MediaCenterModal
          open={showCoverMediaCenter}
          onOpenChange={() => setShowCoverMediaCenter(false)}
          onSelect={handleCoverSelect}
          multiple={false}
          allowedMediaTypes={["cover", "image"]}
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