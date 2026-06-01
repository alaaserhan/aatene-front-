"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { StepperProgress } from "./StepperProgress";
import { StoreFormActions } from "./StoreFormActions";
import { StoreType, ShippingCompanyPayload } from "../api";
import { AddShippingCompanyDialog } from "./AddShippingCompanyDialog";
import { useGetCities } from "../../cities/hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { Step2FormData, Step6FormData } from "../types";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

interface AddStoreStep6Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step6FormData;
  onNext: (data: Step6FormData) => void;
  onBack: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
  variant?: "wizard" | "standalone";
  onSave?: (data: Step6FormData) => void;
  isSaving?: boolean;
  breadcrumbItems?: { label: string; href?: string }[];
}

export function AddStoreStep6({
  initialData,
  onNext,
  onBack,
  barSteps,
  variant = "wizard",
  onSave,
  isSaving = false,
  breadcrumbItems: breadcrumbItemsProp,
}: AddStoreStep6Props) {
  const [shippingCompanies, setShippingCompanies] = useState<
    ShippingCompanyPayload[]
  >(initialData?.shippingCompanies || []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompanyIndex, setEditingCompanyIndex] = useState<number | null>(
    null
  );

  // States for Deletion Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDeleteIndex, setCompanyToDeleteIndex] = useState<number | null>(null);

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const isStandalone = variant === "standalone";
  const steps = barSteps;
  const breadcrumbItems = breadcrumbItemsProp ?? [
    { label: "الرئيسية", href: "/admin/home" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const handleAddCompany = () => {
    setEditingCompanyIndex(null);
    setIsDialogOpen(true);
  };

  const handleEditCompany = (index: number) => {
    setEditingCompanyIndex(index);
    setIsDialogOpen(true);
  };

  // 1. عند الضغط على حذف شركة واحدة
  const handleRemoveCompanyClick = (index: number) => {
    setCompanyToDeleteIndex(index); // تحديد الفهرس للحذف
    setDeleteModalOpen(true);
  };

  // 2. عند الضغط على حذف الكل
  const handleRemoveAllClick = () => {
    setCompanyToDeleteIndex(null); // null يعني حذف الكل
    setDeleteModalOpen(true);
  };

  // 3. تنفيذ الحذف بناءً على الحالة
  const handleConfirmDelete = () => {
    if (companyToDeleteIndex !== null) {
      // حذف شركة واحدة
      setShippingCompanies(shippingCompanies.filter((_, i) => i !== companyToDeleteIndex));
      toast.success("تم حذف شركة الشحن بنجاح");
    } else {
      // حذف الكل
      setShippingCompanies([]);
      toast.success("تم حذف جميع شركات الشحن");
    }
    setDeleteModalOpen(false);
    setCompanyToDeleteIndex(null);
  };

  const handleSaveCompany = (company: ShippingCompanyPayload) => {
    if (editingCompanyIndex !== null) {
      setShippingCompanies(
        shippingCompanies.map((c, i) =>
          i === editingCompanyIndex ? company : c
        )
      );
      toast.success("تم تحديث شركة الشحن بنجاح");
    } else {
      setShippingCompanies([...shippingCompanies, company]);
      toast.success("تمت إضافة شركة الشحن بنجاح");
    }
  };

  const handleSetDefault = (index: number) => {
    if (index === 0) return;

    const companyToMove = shippingCompanies[index];
    const otherCompanies = shippingCompanies.filter((_, i) => i !== index);

    setShippingCompanies([companyToMove, ...otherCompanies]);
    toast.success("تم تعيين الشركة كخيار أساسي");
  };

  const validate = () => {
    if (shippingCompanies.length === 0) {
      toast.error("يجب إضافة شركة شحن واحدة على الأقل");
      return false;
    }
    return true;
  };

  const buildStep6Data = (): Step6FormData => ({
    delivery_type: "shipping",
    shippingCompanies,
  });

  const handleNext = () => {
    if (!validate()) return;
    const data = buildStep6Data();
    if (isStandalone && onSave) {
      onSave(data);
      return;
    }
    onNext(data);
  };

  const getCompanyCities = (company: ShippingCompanyPayload) => {
    if (!company.prices || company.prices.length === 0) return "";
    const cityNames = company.prices
      .map((price) => {
        const city = cities.find((c) => c.id === price.city_id);
        return city?.name;
      })
      .filter(Boolean);

    return cityNames.length > 0 ? `من ${cityNames.join("، ")}` : "";
  };

  return (
    <div className={cn(isStandalone && "pb-28")}>
      <div className="container mx-auto py-3 sm:py-4 px-3 sm:px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-3 sm:mb-4" />
        {!isStandalone && <StepperProgress currentStep={5} steps={steps} />}

        <div className="mt-4 sm:mt-8">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold">
                  شركات الشحن
                </h2>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                      <h3 className="text-base sm:text-lg font-semibold">شركات الشحن</h3>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {shippingCompanies.length > 0 && (
                          <Button
                            onClick={handleRemoveAllClick}
                            variant="outline"
                            className="text-red-1 bg-transparent shadow-none hover:bg-transparent border-none"
                          >
                            حذف الكل
                          </Button>
                        )}
                        <Button
                          onClick={handleAddCompany}
                          className="bg-blue-6 border-blue-4 border text-blue-4 rounded-full px-3 sm:px-4 text-sm sm:text-base flex-1 sm:flex-none"
                        >
                          إضافة شركة شحن
                        </Button>
                      </div>
                    </div>

                    {shippingCompanies.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-2 text-sm">
                          حتى الآن لا يوجد شركات شحن مضافة
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {shippingCompanies.map((company, index) => {
                          const isDefault = index === 0;
                          return (
                            <div
                              key={index}
                              className={cn(
                                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-md transition-colors",
                                "bg-white border-gray-200"
                              )}
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <h4 className="text-sm sm:text-base font-semibold mb-1 break-words">
                                  {company.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-2 break-words">
                                  {getCompanyCities(company)}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
                                <Button
                                  onClick={() => handleRemoveCompanyClick(index)} // تم التعديل هنا لفتح المودال
                                  variant="outline"
                                  className="p-2 border-red-1 bg-red-2 text-red-1 font-medium px-3 sm:px-4 rounded-full text-xs sm:text-sm h-9"
                                >
                                  <img
                                    src="/icons/dashboard/trash.svg"
                                    className="w-4 h-4"
                                    alt=""
                                  />
                                  <p>حذف</p>
                                </Button>
                                <Button
                                  onClick={() => handleEditCompany(index)}
                                  variant="outline"
                                  className="p-2 border-blue-4 bg-blue-6 hover:bg-blue-1 text-blue-4 font-medium px-3 sm:px-4 rounded-full text-xs sm:text-sm h-9"
                                >
                                  <img
                                    src="/icons/dashboard/edit2.svg"
                                    className="w-4 h-4"
                                    alt=""
                                  />
                                  <p>تعديل</p>
                                </Button>

                                <Button
                                  onClick={() => handleSetDefault(index)}
                                  variant={isDefault ? "default" : "outline"}
                                  className={cn(
                                    "rounded-full px-4 py-2 text-sm h-9 border-none shadow-none",
                                    isDefault
                                      ? "bg-[#11CAEF] text-white hover:bg-[#0eaac1] "
                                      : "bg-gray-4 text-gray-2 hover:bg-gray-200"
                                  )}
                                >
                                  أساسي
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFormActions
        onNext={handleNext}
        onBack={onBack}
        isSubmitting={isSaving}
        nextLabel={isStandalone ? "حفظ" : "حفظ والتالي"}
        sticky={isStandalone}
      />

      <AddShippingCompanyDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCompanyIndex(null);
        }}
        onSave={handleSaveCompany}
        editingCompany={
          editingCompanyIndex !== null
            ? shippingCompanies[editingCompanyIndex]
            : null
        }
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCompanyToDeleteIndex(null);
        }}
        onConfirm={handleConfirmDelete}
        title={companyToDeleteIndex !== null ? "حذف شركة الشحن" : "حذف جميع شركات الشحن"}
        description={
          companyToDeleteIndex !== null
            ? "هل أنت متأكد من رغبتك في حذف شركة الشحن هذه؟ لا يمكن التراجع عن هذا الإجراء."
            : "هل أنت متأكد من رغبتك في حذف جميع شركات الشحن المضافة؟ لا يمكن التراجع عن هذا الإجراء."
        }
        confirmText={companyToDeleteIndex !== null ? "نعم، احذف" : "نعم، احذف الكل"}
      />
    </div>
  );
}

