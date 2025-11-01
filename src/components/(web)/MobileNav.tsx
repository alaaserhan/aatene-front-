"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, Menu, X, Search, ChevronLeft, ArrowDownUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserMenu from "./UserMenu";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { Category } from "@/src/features/product/types";

interface MobileNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: { id: number | null; name: string };
  setSelectedCategory: (category: { id: number | null; name: string }) => void;
  categories: Category[];
}

const menuVariants = {
  closed: {
    x: "100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  open: {
    x: "0%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const searchVariants = {
  closed: {
    y: "-100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  open: {
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export default function MobileNav({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: MobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const router = useRouter();
  const lang = useLanguage();
  const user = useAuthStore((state) => state.user);
  const userType = user?.user_type;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    if (selectedCategory.id !== null) {
      params.set('category_id', selectedCategory.id.toString());
    }
    
    router.push(`/${lang}/products?${params.toString()}`);
    setMobileSearchOpen(false); 
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategorySelect = (category: { id: number | null; name: string }) => {
    setSelectedCategory(category);
    setCategoryOpen(false);
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    if (category.id !== null) {
      params.set('category_id', category.id.toString());
    }
    
    router.push(`/${lang}/products?${params.toString()}`);
    setMobileSearchOpen(false); 
  };

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button
          className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link href={`/${lang}`}>
          <img src="/black.svg" className="h-8" alt="logo" />
        </Link>

        <button
          className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
          onClick={toggleMobileSearch}
          aria-label={mobileSearchOpen ? "إغلاق البحث" : "فتح البحث"}
        >
          <Search size={24} />
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-40"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={toggleMobileMenu}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
                  <Link
                    href={`/${lang}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <img src="/black.svg" className="h-8" alt="logo" />
                  </Link>
                  <button
                    onClick={toggleMobileMenu}
                    aria-label="إغلاق القائمة"
                    className="p-2 hover:bg-white/50 rounded-full transition-all duration-200 hover:rotate-90 cursor-pointer"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col justify-between h-full">
                    {/* Navigation Links */}
                    <motion.div
                      className="px-4 py-4 space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">التصفح</h3>
                      </div>

                      <Link
                        href={`/${lang}/chat`}
                        className="group flex items-center justify-between gap-4 p-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                            <img src="/icons/chat.svg" alt="Messages" className="h-5 w-5" />
                          </div>
                          <span className="font-medium">الرسائل</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronLeft size={16} className="text-gray-400" />
                        </div>
                      </Link>

                      <Link
                        href={`/${lang}/favourites`}
                        className="group flex items-center justify-between gap-4 p-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                            <Heart size={20} className="text-gray-500" />
                          </div>
                          <span className="font-medium">المفضلة</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronLeft size={16} className="text-gray-400" />
                        </div>
                      </Link>

                      <Link
                        href={`/${lang}/compare`}
                        className="group flex items-center justify-between gap-4 p-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                            <ArrowDownUp size={20} className="text-gray-500" />
                          </div>
                          <span className="font-medium">المقارنات</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronLeft size={16} className="text-gray-400" />
                        </div>
                      </Link>

                      {userType === "admin" && (
                        <Link
                          href={`/${lang}/admin/stores`}
                          className="group flex items-center justify-between gap-4 p-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                              <img src="/icons/shop.svg" alt="" />
                            </div>
                            <span className="font-medium">المتاجر</span>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ChevronLeft size={16} className="text-gray-400" />
                          </div>
                        </Link>
                      )}
                    </motion.div>

                    {/* User Menu Section */}
                    <div className="px-4 pb-4">
                      <UserMenu isMobile={true} onClose={() => setMobileMenuOpen(false)} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {mobileSearchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={toggleMobileSearch}
            />
            <motion.div
              className="fixed inset-x-0 top-0 bg-white z-50"
              variants={searchVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">البحث</h2>
                  <button onClick={toggleMobileSearch} aria-label="إغلاق البحث" className="cursor-pointer">
                    <X size={24} />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-[#287CDA] h-10 rounded-md py-2 pr-3 focus:outline-none"
                    placeholder="البحث"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className="absolute left-0 top-0 h-10 bg-[#287CDA] cursor-pointer text-white px-4 rounded-l-md"
                    aria-label="بحث"
                    onClick={handleSearch}
                  >
                    البحث
                  </button>
                  <div className="mt-4">
                    <button
                      className="flex items-center gap-1 text-gray-600 text-sm"
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      aria-label={categoryOpen ? "إغلاق قائمة الفئات" : "فتح قائمة الفئات"}
                    >
                      <span>{selectedCategory.name}</span>
                      <ChevronDown size={16} />
                    </button>
                    <AnimatePresence>
                      {categoryOpen && (
                        <motion.div
                          className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            className={`block w-full text-right px-4 py-2 text-sm hover:bg-gray-100 ${
                              selectedCategory.id === null ? 'bg-gray-50 text-[#287CDA] font-medium' : 'text-gray-700'
                            }`}
                            onClick={() => handleCategorySelect({ id: null, name: "جميع الفئات" })}
                          >
                            جميع الفئات
                          </button>
                          
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              className={`block w-full text-right px-4 py-2 text-sm hover:bg-gray-100 ${
                                selectedCategory.id === category.id ? 'bg-gray-50 text-[#287CDA] font-medium' : 'text-gray-700'
                              }`}
                              onClick={() => handleCategorySelect({ id: category.id, name: category.name })}
                            >
                              {category.name}
                            </button>
                          ))}
                          
                          {categories.length === 0 && (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              لا توجد فئات متاحة
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}