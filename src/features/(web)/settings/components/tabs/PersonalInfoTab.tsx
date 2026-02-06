"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Calendar as CalendarIcon } from "lucide-react";
import { useGetAccount, useUpdateAccount, useUpdateAvatar, useGetCities } from "../../hooks";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

// Validation Schema
const personalInfoSchema = z.object({
    first_name: z.string().min(1, "الاسم الأول مطلوب"),
    last_name: z.string().min(1, "الاسم الأخير مطلوب"),
    date_of_birth: z.string().min(1, "تاريخ الميلاد مطلوب"),
    gender: z.string().min(1, "الجنس مطلوب"),
    city_id: z.number().min(1, "المدينة مطلوبة"),
    bio: z.string().optional(),
});

type FormErrors = Partial<Record<keyof typeof personalInfoSchema.shape, string>>;

export default function PersonalInfoTab() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: accountData, isLoading: isLoadingAccount } = useGetAccount();
    const { data: citiesData } = useGetCities();
    const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();
    const { mutate: updateAvatar, isPending: isUploadingAvatar } = useUpdateAvatar();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "male",
        city_id: 0,
        bio: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Populate form with existing data
    useEffect(() => {
        if (accountData?.user) {
            const user = accountData.user;
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "", // Format YYYY-MM-DD
                gender: user.gender || "male",
                city_id: user.city?.id || 0,
                bio: user.bio || "",
            });
            setAvatarPreview(user.avatar);
        }
    }, [accountData]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            updateAvatar(file);
        }
    };

    const validateForm = () => {
        const result = personalInfoSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof FormErrors;
                fieldErrors[path] = issue.message;
            });
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            updateAccount(formData);
        }
    };

    const bioLength = formData.bio.length;

    if (isLoadingAccount) {
        return <div className="text-center py-10">جاري التحميل...</div>;
    }

    const cityOptions = citiesData?.cities?.map(city => ({
        value: String(city.id),
        label: city.name
    })) || [];

    const genderOptions = [
        { value: "male", label: "ذكر" },
        { value: "female", label: "أنثى" }
    ];

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white">
            {/* Header Section */}
            <div className="flex flex-col mb-6">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    المعلومات الشخصية
                </h1>
                <p className="text-gray-400 text-sm">
                    تعديل المعلومات الشخصية
                </p>
            </div>

            <div className="border-b border-gray-100 mb-6 w-full" />

            <form onSubmit={handleSubmit} className="relative">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Right Side: Avatar */}
                    <div className="md:col-span-3 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-[#E5E7EB] border border-white shadow-sm ring-1 ring-gray-100">
                                {avatarPreview ? (
                                    <Image
                                        src={avatarPreview}
                                        alt="Avatar"
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="50" cy="50" r="50" fill="#D1D5DB" />
                                            <circle cx="50" cy="40" r="18" fill="#9CA3AF" />
                                            <path d="M50 62C34.536 62 22 74.536 22 90V92H78V90C78 74.536 65.464 62 50 62Z" fill="#9CA3AF" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {/* Camera Overlay Button */}
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                disabled={isUploadingAvatar}
                                className="absolute bottom-0 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-md hover:bg-gray-50 transition-all cursor-pointer group-hover:scale-110"
                            >
                                <Camera className="w-5 h-5 text-gray-500" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Left Side: Form Fields */}
                    <div className="md:col-span-9 flex flex-col gap-6">

                        {/* Split input rows as requested */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                الاسم الاول
                            </label>
                            <div className="flex flex-col gap-1">
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="الاسم الأول"
                                    className={cn(
                                        "w-full px-6 py-3.5 border rounded-full focus:outline-none focus:border-gray-400 text-right bg-[#FFFFFF] transition-colors",
                                        errors.first_name ? "border-red-500" : "border-gray-200"
                                    )}
                                />
                                {errors.first_name && <p className="text-red-500 text-xs px-4">{errors.first_name}</p>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                الاسم الاخير
                            </label>
                            <div className="flex flex-col gap-1">
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    placeholder="الاسم الأخير"
                                    className={cn(
                                        "w-full px-6 py-3.5 border rounded-full focus:outline-none focus:border-gray-400 text-right bg-[#FFFFFF] transition-colors",
                                        errors.last_name ? "border-red-500" : "border-gray-200"
                                    )}
                                />
                                {errors.last_name && <p className="text-red-500 text-xs px-4">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                تاريخ الميلاد <span className="text-red-500">*</span>
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "w-full px-6 py-3.5 border rounded-full text-right bg-[#FFFFFF] transition-colors flex items-center justify-between hover:bg-gray-50",
                                            errors.date_of_birth ? "border-red-500" : "border-gray-200",
                                        )}
                                    >
                                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                                        <span className={cn("text-right", !formData.date_of_birth && "text-gray-300")}>
                                            {formData.date_of_birth ? format(new Date(formData.date_of_birth), "yyyy/MM/dd") : "4/11/1998"}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-gray-200" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                setFormData({ ...formData, date_of_birth: format(date, "yyyy-MM-dd") });
                                            }
                                        }}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date_of_birth && <p className="text-red-500 text-xs px-4">{errors.date_of_birth}</p>}
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                الجنس <span className="text-red-500">*</span>
                            </label>
                            <ReusableDropdown
                                options={genderOptions}
                                value={formData.gender}
                                onChange={(val) => setFormData({ ...formData, gender: val })}
                                placeholder="ذكر"
                                className={cn(
                                    "rounded-full h-[54px] focus-within:ring-0 focus-within:border-gray-400",
                                    errors.gender ? "border-red-500" : "border-gray-200"
                                )}
                                error={errors.gender}
                            />
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                المدينة <span className="text-red-500">*</span>
                            </label>
                            <ReusableDropdown
                                options={cityOptions}
                                value={String(formData.city_id)}
                                onChange={(val) => setFormData({ ...formData, city_id: Number(val) })}
                                placeholder="اختر المدينة"
                                className={cn(
                                    "rounded-full h-[54px] focus-within:ring-0 focus-within:border-gray-400",
                                    errors.city_id ? "border-red-500" : "border-gray-200"
                                )}
                                error={errors.city_id}
                            />
                        </div>


                        {/* Bio */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                النبذة الشخصية
                            </label>
                            <div className="relative">
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="هنا مثال لوصف...."
                                    rows={6}
                                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400 text-right resize-none placeholder:text-gray-300 transition-colors"
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                <div className="flex items-center gap-1.5 ">
                                    <div className="w-4 h-4 rounded-full border border-blue-3 flex items-center justify-center text-blue-3 text-[11px] font-medium">i</div>
                                    <span className="text-right">لا بأس إن تجاوز النص 300 كلمة، يسمح بمرونة في عدد الكلمات حسب الحاجة.</span>
                                </div>
                                <span className="order-1">{bioLength}/50</span>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className={cn(
                                    "bg-blue-3 text-white px-14 py-2.5 rounded-full font-medium transition-all shadow-sm active:scale-95 cursor-pointer",
                                    isUpdating && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                {isUpdating ? "جاري الحفظ..." : "حفظ"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
