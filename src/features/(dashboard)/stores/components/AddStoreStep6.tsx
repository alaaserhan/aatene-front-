// src/features/(dashboard)/stores/components/AddStoreStep6.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { StoreFormActions } from "./StoreFormActions";
import { StoreType, DeliveryType, ShippingCompanyPayload } from "../api";
import { AddShippingCompanyDialog } from "./AddShippingCompanyDialog";
import { useGetCities } from "../../cities/hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { Step2FormData, Step6FormData } from "../types";

interface AddStoreStep6Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step6FormData;
  onNext: (data: Step6FormData) => void;
  onBack: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
}

export function AddStoreStep6({
  storeType,
  previousData,
  initialData,
  onNext,
  onBack,
  barSteps,
}: AddStoreStep6Props) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    initialData?.delivery_type || "shipping"
  );
  const [shippingCompanies, setShippingCompanies] = useState<
    ShippingCompanyPayload[]
  >(initialData?.shippingCompanies || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompanyIndex, setEditingCompanyIndex] = useState<number | null>(
    null
  );

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const steps = barSteps;
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
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

  const handleRemoveCompany = (index: number) => {
    setShippingCompanies(shippingCompanies.filter((_, i) => i !== index));
    toast.success("تم حذف شركة الشحن بنجاح");
  };

  const handleRemoveAll = () => {
    if (window.confirm("هل أنت متأكد من حذف جميع شركات الشحن؟")) {
      setShippingCompanies([]);
      toast.success("تم حذف جميع شركات الشحن");
    }
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
        shippingCompanies:
          deliveryType === "shipping" ? shippingCompanies : [],
      });
    }
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
    <div className="">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <StepperProgress currentStep={5} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold ">
                  اختيار طريقة الشحن
                </h2>
              </div>

              <div className="p-6">
                <div className="mb-8">
                  <h3 className="text-base font-medium  mb-4 text-right">
                    كيف تود شحن المنتجات؟
                  </h3>

                  <div className="flex flex-row items-center gap-8">
                    <DeliveryOption
                      value="free"
                      label="مجاني"
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

                {deliveryType === "shipping" && (
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">شركات الشحن</h3>
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
                          const isDefault = index === 0;
                          return (
                            <div
                              key={index}
                              className={cn(
                                "flex items-center justify-between p-4 border rounded-md transition-colors",

                                "bg-white border-gray-200"
                              )}
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-semibold mb-1">
                                    {company.name}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {getCompanyCities(company)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">


                                <Button
                                  onClick={() => handleRemoveCompany(index)}
                                  variant="outline"
                                  className="p-2 border-red-1 bg-red-2 text-red-1 font-medium px-4 rounded-full"
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
                                  className="p-2 border-blue-4 bg-blue-6 hover:bg-blue-1 text-blue-4 font-medium px-4 rounded-full"
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
                )}
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <StorePreviewSidebar
              data={{
                logo: previousData.logo_preview,
                name: previousData.name,
                description: previousData.description,
                coverImages: previousData.cover_previews,
              }}
            />
          </div>
        </div>
      </div>

      <StoreFormActions onNext={handleNext} onBack={onBack} />

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
    </div>
  );
}

interface DeliveryOptionProps {
  value: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function DeliveryOption({ label, selected, onClick }: DeliveryOptionProps) {
  return (
    <div onClick={onClick} className="flex items-start gap-2 cursor-pointer">
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