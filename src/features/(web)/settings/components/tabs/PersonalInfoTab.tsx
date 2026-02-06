"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Calendar } from "lucide-react";
import { useGetAccount, useUpdateAccount, useUpdateAvatar, useGetCities } from "../../hooks";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

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

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Populate form with existing data
    useEffect(() => {
        if (accountData?.user) {
            const user = accountData.user;
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                date_of_birth: user.date_of_birth || "",
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAccount(formData);
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
        <div className=" rounded-xl p-4 md:p-6 border border-gray-200">
            {/* Header Section */}
            <div className="flex flex-col mb-6">
                <h1 className="text-3xl font-bold text-[#3D3D3D] mb-1">
                    المعلومات الشخصية
                </h1>
                <p className="text-gray-2 text-sm">
                    تعديل المعلومات الشخصية
                </p>
            </div>

            <div className="border-b border-gray-100 mb-10 w-full" />

            <form onSubmit={handleSubmit} className="relative">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Right Side: Avatar */}
                    <div className="md:col-span-3 flex flex-col items-center ">
                        <div className="relative group">
                            <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-[#E5E7EB] border-1 border-white shadow-sm ring-1 ring-gray-100">
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
                    <div className="md:col-span-9 flex flex-col gap-8 ">

                        {/* Full Name */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                الاسم الكامل
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="أبانوب"
                                    className="w-full px-6 py-3.5 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-3 focus:border-blue-3 text-right bg-[#FFFFFF]"
                                />
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    placeholder="أشرف"
                                    className="w-full px-6 py-3.5 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-3 focus:border-blue-3 text-right bg-[#FFFFFF]"
                                />
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                تاريخ الميلاد <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="w-full px-6 py-3.5 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-3 focus:border-blue-3 text-right bg-[#FFFFFF] appearance-none"
                                />
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
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
                                className="rounded-full h-[54px]"
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
                                placeholder="غزة"
                                className="rounded-full h-[54px]"
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
                                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-3 focus:border-blue-3 text-right resize-none placeholder:text-gray-300"
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                <div className="flex items-center gap-1.5 ">
                                    <div className="w-3.5 h-3.5 rounded-full border border-blue-3 flex items-center justify-center text-blue-3 text-[8px] font-bold">i</div>
                                    <span className="text-right">لا بأس إن تجاوز النص 300 كلمة، يسمح بمرونة في عدد الكلمات حسب الحاجة.</span>
                                </div>
                                <span className="">{bioLength}/50</span>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className={cn(
                                    "bg-blue-3 text-white px-14 py-2.5 rounded-full font-medium  transition-all shadow-sm  active:scale-95 cursor-pointer",
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
