"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { LogOut, User, Store, Crown, Shield, ChevronRight, ChevronLeft, ChevronDown, Settings, Headset } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/src/lib/axios";
import { useLanguage } from "@/src/hooks/use-language";
import { useLogout } from "@/src/features/(web)/auth/hooks";
import { Button } from "../ui/button";

interface UserMenuProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const UserMenu = ({ isMobile = false, onClose }: UserMenuProps) => {
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lang = useLanguage();
  const { mutate: logoutMutation } = useLogout();

  const handleTheClientClick = async () => {
    try {
      setIsLoading(true);
      const response = await api.post("/convert-to-merchant", {});
      
      if (response.data.status) {
        toast.success("تم التحويل لتاجر بنجاح");
        // Refresh user data - you might need to create a refetch function in auth store
        // For now, you could refresh the page or implement a user data refresh
        window.location.reload();
        setIsOpen(false);
        onClose?.();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleLogout = () => {
    logoutMutation();
    setIsOpen(false);
    onClose?.();
  };

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMobile]);

  if (!isAuthenticated || !user) {
    return (
      <Link 
        href={`/${lang}/login`}
        className={`group flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-primary transition-all duration-200 ${
          isMobile 
            ? "w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary/30 hover:bg-primary/5" 
            : "px-4 py-2 rounded-lg hover:bg-gray-50"
        }`}
        onClick={handleLinkClick}
      >
        <div className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-200`}>
          <User size={isMobile ? 20 : 18} className="text-gray-500 group-hover:text-primary" />
        </div>
        <div className="flex-1">
          <span className={`${isMobile ? 'text-base font-semibold' : ''} block`}>تسجيل الدخول</span>
          {isMobile && (
            <span className="text-xs text-gray-500 mt-1 block">للوصول إلى جميع المميزات</span>
          )}
        </div>
        {isMobile && (
          <ChevronRight size={16} className="text-gray-400 group-hover:text-primary" />
        )}
      </Link>
    );
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "admin":
        return <Crown size={14} className="text-yellow-600" />;
      case "merchant":
        return <Store size={14} className="text-blue-600" />;
      default:
        return <Shield size={14} className="text-green-600" />;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const badgeClasses = {
      admin: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200",
      merchant: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200",
      client: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200"
    };

    const labels = {
      admin: "مدير",
      merchant: "تاجر", 
      client: "عميل"
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClasses[userType as keyof typeof badgeClasses]}`}>
        {getUserTypeIcon(userType)}
        {labels[userType as keyof typeof labels]}
      </span>
    );
  };

  // Mobile Version 
  if (isMobile) {
    return (
      <div className="w-full">
        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-4 mb-4">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullname} 
                className="w-14 h-14 rounded-full object-cover ring-3 ring-white shadow-lg" 
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center font-bold text-lg shadow-lg">
                {user.fullname[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg truncate">{user.fullname}</h3>
              <p className="text-gray-600 text-sm truncate">{user.email}</p>
              <div className="mt-2">
                {getUserTypeBadge(user.user_type)}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <Link href={`/${lang}/report/inquiry`} className="flex items-center gap-3 text-sm text-gray-600" onClick={handleLinkClick}>
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Headset size={12} />
              </div>
              <span dir="ltr" className="font-medium">استعلام عن شكوى</span>
            </Link>

            <Link href={`/${lang}/profile`} className="flex items-center gap-3 text-sm text-gray-600" onClick={handleLinkClick}>
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings size={12} />
              </div>
              <span className="font-medium">الاعدادات</span>
            </Link>
          </div>

          {/* Action Button */}
          {user.user_type === "client" && (
            <Button
              disabled={isLoading}
              onClick={handleTheClientClick}
              className="w-full justify-start h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm transition-all duration-200 mt-3"
            >
              <Store size={16} />
              <span className="mr-2">الدخول كتاجر</span>
              {isLoading && (
                <div className="ml-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </Button>
          )}
        </div>

        {/* Action Links */}
        <div className="space-y-2">
          {user.user_type === "admin" && (
            <Link 
              href={`/${lang}/admin`}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group border border-gray-200"
              onClick={handleLinkClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <Crown size={16} className="text-yellow-600" />
                </div>
                <span className="font-medium">لوحة التحكم</span>
              </div>
              <ChevronLeft size={16} className="text-gray-400 group-hover:text-yellow-600" />
            </Link>
          )}

          {user.user_type === "merchant" && (
            <Link 
              href={`/${lang}/dashboard`}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group border border-gray-200"
              onClick={handleLinkClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Store size={16} className="text-blue-600" />
                </div>
                <span className="font-medium">لوحة التحكم</span>
              </div>
              <ChevronLeft size={16} className="text-gray-400 group-hover:text-blue-600" />
            </Link>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center justify-between w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group border border-red-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <LogOut size={16} />
              </div>
              <span className="font-medium">تسجيل الخروج</span>
            </div>
            <ChevronLeft size={16} className="text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    );
  }

  // Desktop Version 
  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
      >
        <div className="relative">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.fullname} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary/30 transition-all duration-200" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center font-semibold text-sm group-hover:from-primary group-hover:to-primary/90 transition-all duration-200">
              {user.fullname[0]?.toUpperCase() || <User size={18} />}
            </div>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 rounded-xl shadow-xl bg-white ring-1 ring-gray-900/5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Header Section */}
          <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullname} 
                  className="w-14 h-14 rounded-full object-cover ring-3 ring-white shadow-md" 
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {user.fullname[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">{user.fullname}</h3>
                <p className="text-gray-600 text-sm truncate">{user.email}</p>
                <div className="mt-2">
                  {getUserTypeBadge(user.user_type)}
                </div>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="px-6 py-4 space-y-3 border-b border-gray-100">
            <Link href={`/${lang}/report/inquiry`} className="flex items-center gap-3 text-sm text-gray-600" onClick={handleLinkClick}>
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Headset size={12} />
              </div>
              <span dir="ltr" className="font-medium">استعلام عن شكوى</span>
            </Link>

            <Link href={`/${lang}/profile`} className="flex items-center gap-3 text-sm text-gray-600" onClick={handleLinkClick}>
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings size={12} />
              </div>
              <span className="font-medium">الاعدادات</span>
            </Link>
          </div>

          {/* Actions Section */}
          <div className="p-4 space-y-2">
            {user.user_type === "client" && (
              <Button
                disabled={isLoading}
                onClick={handleTheClientClick}
                className="w-full justify-start h-auto py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm transition-all duration-200"
              >
                <Store size={16} />
                <span className="mr-3">الدخول كتاجر</span>
                {isLoading && (
                  <div className="ml-auto w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
              </Button>
            )}

            {user.user_type === "admin" && (
              <Link 
                href={`/${lang}/admin`}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                onClick={handleLinkClick}
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <Crown size={16} className="text-yellow-600" />
                </div>
                <span className="font-medium">لوحة التحكم</span>
              </Link>
            )}

            {user.user_type === "merchant" && (
              <Link 
                href={`/${lang}/dashboard`}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                onClick={handleLinkClick}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Store size={16} className="text-blue-600" />
                </div>
                <span className="font-medium">لوحة التحكم</span>
              </Link>
            )}
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center cursor-pointer gap-3 w-full px-6 py-4 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <LogOut size={16} />
              </div>
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;