"use client";

import { useState } from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";
// import MaxWidthWrapper from "./MaxwidthWrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { useSearchData } from "@/src/features/product/hooks";
import { Category } from "@/src/features/product/types";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: { id: number | null; name: string };
  setSelectedCategory: (category: { id: number | null; name: string }) => void;
  categoryOpen: boolean;
  setCategoryOpen: (open: boolean) => void;
  categories: Category[];
  isLoadingCategories: boolean;
}

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number | null; name: string }>({
    id: null,
    name: "جميع الفئات"
  });
  
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const lang = useLanguage();

  const { data: searchData, isLoading: isLoadingCategories } = useSearchData();

 const parentCategories = searchData?.categories?.filter(
    (category: Category) => !category.parent_id || category.parent_id === null
  ) || [];

  return (
    <div className="w-full shadow-sm" dir="rtl">
      {/* Mobile Navigation */}
      <MobileNav
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={parentCategories}
      />

      {/* Desktop Navigation */}
      <div className="hidden md:block container my-2">
        {/* <MaxWidthWrapper noPaddingX={true} className="!py-5"> */}
          <div className="flex items-center justify-between gap-6">
            <Link href={`/${lang}`} className="flex items-center gap-4">
              <img src="/black.svg" className="h-10" alt="logo" />
            </Link>

            <div className="flex-1 max-w-2xl">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categoryOpen={categoryOpen}
                setCategoryOpen={setCategoryOpen}
                categories={parentCategories}
                isLoadingCategories={isLoadingCategories}
              />
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
              {isAuthenticated && <NavIcons />}
              <UserMenu />
            </div>
          </div>
        {/* </MaxWidthWrapper> */}
      </div>
    </div>
  );
};

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categoryOpen,
  setCategoryOpen,
  categories,
  isLoadingCategories,
}: SearchBarProps) => {
  const router = useRouter();
  const lang = useLanguage();

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    if (selectedCategory.id !== null) {
      params.set('category_id', selectedCategory.id.toString());
    }
    
    router.push(`/${lang}/products?${params.toString()}`);
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
  };

  return (
    <div className="relative flex">
      <input
        type="text"
        className="w-full border border-[#287CDA] rounded-md h-10 py-2 pr-3 focus:outline-none"
        placeholder="البحث"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        className="absolute cursor-pointer left-0 top-0 lg:text-base text-sm bg-[#287CDA] text-white px-6 rounded-l-md h-10 flex items-center"
        aria-label="بحث"
        onClick={handleSearch}
      >
        البحث
      </button>
      <div className="absolute left-20 top-0 h-full flex items-center">
        <div className="relative">
          <button
            className="flex items-center gap-1 px-3 text-black text-sm h-full"
            onClick={() => setCategoryOpen(!categoryOpen)}
            aria-label={categoryOpen ? "إغلاق قائمة الفئات" : "فتح قائمة الفئات"}
            disabled={isLoadingCategories}
          >
            <span>
              {isLoadingCategories ? "جاري التحميل..." : selectedCategory.name}
            </span>
            <ChevronDown size={20} className="text-[#414141c6] mx-2" />
          </button>

          {categoryOpen && !isLoadingCategories && (
            <div
              className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-sm z-10 max-h-60 overflow-y-auto"
              role="listbox"
            >
              <button
                className={`block w-full text-right px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedCategory.id === null ? 'bg-gray-50 text-[#287CDA] font-medium' : 'text-gray-700'
                }`}
                onClick={() => handleCategorySelect({ id: null, name: "جميع الفئات" })}
                role="option"
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
                  role="option"
                >
                  {category.name}
                </button>
              ))}
              
              {categories.length === 0 && !isLoadingCategories && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  لا توجد فئات متاحة
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavIcons = () => {
  const user = useAuthStore((state) => state.user);
  const lang = useLanguage();
  const userType = user?.user_type;

  return (
    <div className="flex items-center gap-4 lg:gap-7 text-gray-500">
      <Link href={`/${lang}/compare`} className="flex items-center">
        <button className="text-gray-500 cursor-pointer" aria-label="المقارنات">
          <ArrowDownUp className="h-5 w-5" />
        </button>
      </Link>
      {userType === "admin" && (
        <Link href={`/${lang}/admin/stores`} className="flex items-center">
          <button className="hover:text-gray-700 cursor-pointer" aria-label="الفئات">
            <img src="/icons/shop.svg" alt="" />
          </button>
        </Link>
      )}
      <Link href={`/${lang}/favourites`} className="flex items-center">
        <button className="hover:text-gray-700 cursor-pointer" aria-label="المفضلة">
          <img src="/icons/heart.svg" alt="Favorites" className="h-5 w-5" />
        </button>
      </Link>
      <Link href={`/${lang}/chat`} className="flex items-center">
        <button className="hover:text-gray-700 cursor-pointer" aria-label="الرسائل">
          <img src="/icons/chat.svg" alt="Messages" className="h-5 w-5" />
        </button>
      </Link>
    </div>
  );
};

export default Navbar;