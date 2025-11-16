// src/features/(dashboard)/categoriesAndAttributes/components/CategoriesPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { CategoryAccordion } from "./CategoryAccordion";
import { CategoryModal, CategoryFormData } from "./CategoryModal";
import { ImageViewerModal } from "./ImageViewerModal";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { Category } from "../api";
import {
  useGetParentCategories,
  useGetCategoryOptions,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Pagination } from "@/src/components/ui/Pagination";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { cn } from "@/src/lib/utils";

const ITEMS_PER_PAGE = 10;

type PageMode = "product" | "service";
type ProductSubMode = "categories" | "attributes";

export function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );
  const [pageMode, setPageMode] = useState<PageMode>("product");
  const [productSubMode, setProductSubMode] =
    useState<ProductSubMode>("categories");
  const [currentPage, setCurrentPage] = useState(1);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "addSub">("add");
  const [parentIdForSub, setParentIdForSub] = useState<number | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  const activeType = pageMode;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", activeType);
    params.set("page", String(currentPage));
    params.set("per_page", String(ITEMS_PER_PAGE));
    if (searchQuery) {
      params.set("name", searchQuery);
    }
    return params;
  }, [activeType, currentPage, searchQuery]);

  const { data: categoriesData, isLoading } =
    useGetParentCategories(queryParams);
  const { data: categoryOptionsData } = useGetCategoryOptions();

  const { mutate: createCategoryMutation } = useCreateCategory();
  const { mutate: updateCategoryMutation } = useUpdateCategory();
  const { mutate: deleteCategoryMutation } = useDeleteCategory();

  const categories = categoriesData?.data || [];
  const totalPages = Math.ceil(
    (categoriesData?.recordsFiltered || 0) / ITEMS_PER_PAGE
  );
  const categoryOptions = categoryOptionsData?.categories || [];

  const filterOptions = [
    { name: "الفئات", value: "categories" },
    { name: "السمات", value: "attributes" },
  ];

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalMode("add");
    setParentIdForSub(null);
    setCategoryModalOpen(true);
  };

  const handleAddSubCategory = (parentId: number, name: string) => {
    setSelectedCategory(null);
    setModalMode("addSub");
    setParentIdForSub(parentId);
    setCategoryModalOpen(true);
    setParentName(name);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setCategoryModalOpen(true);
  };

  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete !== null) {
      deleteCategoryMutation(categoryToDelete);
      setDeleteModalOpen(false);
    }
  };

  const handleSaveCategory = (categoryData: CategoryFormData) => {
    const payload = {
      name: categoryData.name,
      images: categoryData.images,
      is_active: categoryData.is_active ? ("1" as "1") : ("0" as "0"),
      parent_id: categoryData.parent_id,
      type: activeType,
    };

    const mutationOptions = {
      onSuccess: () => {
        setCategoryModalOpen(false);
      },
    };

    if (modalMode === "edit" && selectedCategory) {
      updateCategoryMutation(
        { id: selectedCategory.id, payload },
        mutationOptions
      );
    } else {
      createCategoryMutation(payload, mutationOptions);
    }
  };

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleViewImages = (images: string[]) => {
    setViewerImages(images);
    setImageViewerOpen(true);
  };

  // تحديد نصوص modal الحذف حسب نوع الصفحة
  const getDeleteModalTexts = () => {
    if (pageMode === "product") {
      if (productSubMode === "attributes") {
        return {
          title: "هل أنت متأكد من حذف السمة؟",
          description: "سيتم حذف السمة وجميع الخيارات التابعة لها بشكل نهائي"
        };
      }
      return {
        title: "هل أنت متأكد من حذف الفئة؟",
        description: "سيتم حذف الفئة وجميع الفئات الفرعية التابعة لها بشكل نهائي"
      };
    }
    // service
    return {
      title: "هل أنت متأكد من حذف الخدمة؟",
      description: "سيتم حذف الخدمة وجميع الخدمات الفرعية التابعة لها بشكل نهائي"
    };
  };

  const deleteTexts = getDeleteModalTexts();

  return (
    <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)] flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
        <div className="flex items-center justify-between h-16 px-6">
          <nav className="flex items-center h-full">
            <ul className="flex items-center gap-8 h-full">
              <li className="h-full flex items-center">
                <button
                  onClick={() => setPageMode("product")}
                  className={cn(
                    "text-sm font-semibold h-full flex items-center transition-colors",
                    pageMode === "product"
                      ? "text-[#3A5779] border-b-2 border-[#3A5779]"
                      : "text-gray-500 hover:text-[#3A5779]"
                  )}
                >
                  المنتجات
                </button>
              </li>
              <li className="h-full flex items-center">
                <button
                  onClick={() => setPageMode("service")}
                  className={cn(
                    "text-sm font-semibold h-full flex items-center transition-colors",
                    pageMode === "service"
                      ? "text-[#3A5779] border-b-2 border-[#3A5779]"
                      : "text-gray-500 hover:text-[#3A5779]"
                  )}
                >
                  الخدمات
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-6 h-[calc(100vh-65px)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          {pageMode === "product" && (
            <div className="col-span-12 lg:col-span-3 h-full">
              <SidebarFilterPanel
                options={filterOptions}
                activeValue={productSubMode}
                onValueChange={(value) =>
                  setProductSubMode(value as ProductSubMode)
                }
                className="h-full"
              />
            </div>
          )}

          <div
            className={cn(
              "h-full flex flex-col gap-6",
              pageMode === "product"
                ? "col-span-12 lg:col-span-9"
                : "col-span-12"
            )}
          >
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="relative flex-1 w-full sm:w-auto">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    pageMode === "product"
                      ? "ابحث باسم الفئة أو الفئة الفرعية"
                      : "ابحث باسم الخدمة أو الخدمة الفرعية"
                  }
                  className="w-full px-4 py-3 ps-12 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-3 focus:border-transparent"
                />
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <Button
                onClick={handleAddCategory}
                className="flex items-center gap-2 px-6 py-3 bg-blue-3 w-full sm:w-auto  text-white text-sm font-semibold rounded-xs transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                {pageMode === "product"
                  ? "إضافة فئة منتجات جديدة"
                  : "إضافة خدمة جديدة"}
              </Button>
            </div>
            <div className="bg-white rounded-lg p-1 sm:p-4">

              <ScrollArea className="flex-1 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 bg-white rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                      <span className="text-sm text-gray-600">
                        جاري تحميل البيانات...
                      </span>
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-gray-500">لا توجد فئات لعرضها</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <CategoryAccordion
                      key={category.id}
                      category={category}
                      selectedCategories={selectedCategories}
                      onToggleCategory={handleToggleCategory}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteClick}
                      onAddSubCategory={handleAddSubCategory}
                      onViewImages={handleViewImages}
                      level={0}
                    />
                  ))
                )}
              </ScrollArea>

              {totalPages > 1 && (
                <div className="p-4 ">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    className={isLoading ? "opacity-50 pointer-events-none" : ""}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
        mode={modalMode}
        parentId={parentIdForSub}
        parentName={parentName}
        categoryOptions={categoryOptions}
        currentType={activeType}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteTexts.title}
        description={deleteTexts.description}
      />

      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        images={viewerImages}
      />
    </div>
  );
}