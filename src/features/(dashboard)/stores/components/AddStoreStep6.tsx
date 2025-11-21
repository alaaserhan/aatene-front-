// src/features/(dashboard)/stores/components/AddStoreStep6.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { StoreFormActions } from "./StoreFormActions";
import {
  StoreType,
  DeliveryType,
  ShippingCompany,
} from "../api";
import { AddShippingCompanyDialog } from "./AddShippingCompanyDialog";
import { useGetCities } from "../../cities/hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";
import { Minus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AddStoreStep6Props {
  storeType: StoreType;
  previousData: any;
  initialData?: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function AddStoreStep6({
  storeType,
  previousData,
  initialData,
  onNext,
  onBack,
}: AddStoreStep6Props) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    initialData?.delivery_type || "shipping"
  );
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>(
    initialData?.shippingCompanies || []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ShippingCompany | null>(
    null
  );
  const [defaultCompanyId, setDefaultCompanyId] = useState<number | null>(null);

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const steps = [
    { number: 1, label: "البيانات الأساسية", completed: true },
    { number: 2, label: "الاتصال والسوشيال ميديا", completed: true },
    { number: 3, label: "موظفين المتجر", completed: true },
    { number: 4, label: "أوقات العمل و العطلات", completed: true },
    { number: 5, label: "طريقة الشحن", completed: false },
    { number: 6, label: "الكلمات المفتاحية", completed: false },
  ];

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const handleAddCompany = () => {
    setEditingCompany(null);
    setIsDialogOpen(true);
  };

  const handleEditCompany = (company: ShippingCompany) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const handleRemoveCompany = (companyToRemove: ShippingCompany) => {
    setShippingCompanies(
      shippingCompanies.filter((c) => c !== companyToRemove)
    );
    if (defaultCompanyId === companyToRemove.id) {
      setDefaultCompanyId(null);
    }
    toast.success("تم حذف شركة الشحن بنجاح");
  };

  const handleRemoveAll = () => {
    if (
      window.confirm("هل أنت متأكد من حذف جميع شركات الشحن؟")
    ) {
      setShippingCompanies([]);
      setDefaultCompanyId(null);
      toast.success("تم حذف جميع شركات الشحن");
    }
  };

  const handleSaveCompany = (company: ShippingCompany) => {
    if (editingCompany) {
      // Update existing company
      setShippingCompanies(
        shippingCompanies.map((c) =>
          c === editingCompany ? company : c
        )
      );
      toast.success("تم تحديث شركة الشحن بنجاح");
    } else {
      // Add new company
      setShippingCompanies([...shippingCompanies, company]);
      toast.success("تمت إضافة شركة الشحن بنجاح");
    }
  };

  const handleSetDefault = (company: ShippingCompany) => {
    setDefaultCompanyId(company.id || null);
    toast.success("تم تعيين الشركة كأساسية");
  };

  const validate = () => {
    if (deliveryType === "shipping") {
      if (shippingCompanies.length === 0) {
        toast.error("يجب إضافة شركة شحن واحدة على الأقل");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      onNext({
        delivery_type: deliveryType,
        shippingCompanies: deliveryType === "shipping" ? shippingCompanies : [],
      });
    }
  };

  // Get city names for a company
  const getCompanyCities = (company: ShippingCompany) => {
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
    <div className="">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <StepperProgress currentStep={5} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-3">
            <StorePreviewSidebar
              data={{
                logo: previousData.logo_preview,
                name: previousData.name,
                description: previousData.description,
                coverImages: previousData.cover,
              }}
            />
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  اختيار طريقة الشحن
                </h2>
              </div>

                <div className="p-6">
                  {/* Delivery type options */}
                  <div className="mb-8">
                    <h3 className="text-base font-medium text-gray-900 mb-4 text-right">
                      كيف تود شحن المنتجات؟
                    </h3>

                    <div className="flex flex-row items-center gap-8">

                      <DeliveryOption
                        value="hand_delivery"
                        label='مجاني'
                        selected={deliveryType === "free"}
                        onClick={() => setDeliveryType("free")}
                      />


                      <DeliveryOption
                        value="hand_delivery"
                        label='من يد لـ يد "دون شركات توصيل"'
                        selected={deliveryType === "hand_delivery"}
                        onClick={() => setDeliveryType("hand_delivery")}
                      />

                      <DeliveryOption
                        value="shipping"
                        label="من خلال شركة توصيل"
                        selected={deliveryType === "shipping"}
                        onClick={() => setDeliveryType("shipping")}
                      />
                    </div>
                  </div>

                  {/* Shipping companies section */}
                  {deliveryType === "shipping" && (
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold ">
                          شركات الشحن
                        </h3>
                        <div className="flex gap-3">
                          {shippingCompanies.length > 0 && (
                            <Button
                              onClick={handleRemoveAll}
                              variant="outline"
                              className="text-red-1 bg-transparent shadow-none hover:bg-transparent border-none"
                            >
                              حذف الكل
                            </Button>
                          )}
                          <Button
                            onClick={handleAddCompany}
                            className="bg-blue-6 border-blue-4 border text-blue-4 rounded-full px-4"
                          >
                            إضافة شركة شحن
                          </Button>
                        </div>
                      </div>

                      {shippingCompanies.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-400 text-sm">
                            حتى الآن لا يوجد شركات شحن مضافة
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {shippingCompanies.map((company, index) => {
                            const isDefault = defaultCompanyId === company.id;
                            
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md"
                              >
                                {/* Company info */}
                                <div className="flex flex-col">
                                  <h4 className="text-base font-semibold mb-1">
                                    {company.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {getCompanyCities(company)}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => handleSetDefault(company)}
                                    variant={isDefault ? "default" : "outline"}
                                    className={cn(
                                      "rounded-full px-4 py-2 text-sm",
                                      isDefault
                                        ? "bg-sky-500 text-white hover:bg-sky-600"
                                        : "bg-gray-100 text-gray-2 hover:bg-gray-2"
                                    )}
                                  >
                                    أساسي
                                  </Button>

                                  <Button
                                    onClick={() => handleEditCompany(company)}
                                    variant="outline"
                                    className="p-2 border-blue-4 bg-blue-6 hover:bg-blue-1 text-blue-4 font-medium px-4 rounded-full"
                                  >
                                    <img src="/icons/dashboard/pin.svg" className="w-4 h-4" alt="" />
                                    <p>تعديل</p>
                                  </Button>

                                  <Button
                                    onClick={() => handleRemoveCompany(company)}
                                    variant="outline"
                                    className="p-2 border-red-1 bg-red-2  text-red-1 font-medium px-4 rounded-full"
                                  >
                                    <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
                                    <p>حذف</p>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFormActions onNext={handleNext} onBack={onBack} />

      {/* Dialog */}
      <AddShippingCompanyDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        editingCompany={editingCompany}
      />
    </div>
  );
}

// --- Helper Components ---

interface DeliveryOptionProps {
  value: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function DeliveryOption({
  label,
  selected,
  onClick,
}: DeliveryOptionProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-2 cursor-pointer"
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
            selected ? "border-[#3A5779]" : "border-gray-300"
          )}
        >
          {selected && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#3A5779]" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <h4
          className={cn(
            "font-medium text-sm",
            selected ? "text-[#3A5779]" : "text-gray-600"
          )}
        >
          {label}
        </h4>
      </div>
    </div>
  );
}