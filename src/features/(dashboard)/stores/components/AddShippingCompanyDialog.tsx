// src/features/(dashboard)/stores/components/AddShippingCompanyDialog.tsx
"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { ShippingCompany, ShippingPrice } from "../api";
import { useGetCities } from "../../cities/hooks";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AddShippingCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: ShippingCompany) => void;
  editingCompany?: ShippingCompany | null;
}

interface PriceData {
  days: number;
  price: number;
}

export function AddShippingCompanyDialog({
  isOpen,
  onClose,
  onSave,
  editingCompany,
}: AddShippingCompanyDialogProps) {
  const [step, setStep] = useState(1);
  
  const [phoneCountryCode, setPhoneCountryCode] = useState("+970");
  
  const [companyName, setCompanyName] = useState(editingCompany?.name || "");
  
  const [selectedCityIds, setSelectedCityIds] = useState<number[]>(() => 
    editingCompany ? editingCompany.prices.map((p) => p.city_id) : []
  );

  const [shippingPrices, setShippingPrices] = useState<Record<number, PriceData>>(() => {
    if (editingCompany) {
      const pricesMap: Record<number, PriceData> = {};
      editingCompany.prices.forEach((p) => {
        pricesMap[p.city_id] = { days: p.days, price: p.price };
      });
      return pricesMap;
    }
    return {};
  });

  const [storeName, setStoreName] = useState(editingCompany?.name || "");
  
  const [storePhone, setStorePhone] = useState(() => 
    editingCompany 
      ? String(editingCompany.phone).replace("+970", "").replace("+20", "").replace("+966", "").replace("+971", "")
      : ""
  );

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const handleCityToggle = (cityId: number) => {
    setSelectedCityIds((prev) => {
      if (prev.includes(cityId)) {
        return prev.filter((id) => id !== cityId);
      } else {
        return [...prev, cityId];
      }
    });
  };

  const handleStep1Next = () => {
    if (!companyName.trim()) {
      toast.error("يجب إدخال اسم ملف الشحن");
      return;
    }

    if (selectedCityIds.length === 0) {
      toast.error("يجب اختيار مدينة واحدة على الأقل");
      return;
    }

    setShippingPrices((prev) => {
        const newPrices: Record<number, PriceData> = { ...prev };
        selectedCityIds.forEach((cityId) => {
          if (!newPrices[cityId]) {
            newPrices[cityId] = { days: 3, price: 20.0 };
          }
        });
        return newPrices;
    });
    
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!storeName.trim()) {
      toast.error("يجب إدخال اسم شركة الشحن");
      return;
    }

    if (!storePhone.trim()) {
      toast.error("يجب إدخال رقم الهاتف");
      return;
    }

    for (const cityId of selectedCityIds) {
      const priceData = shippingPrices[cityId];
      if (!priceData || priceData.price <= 0 || priceData.days <= 0) {
        toast.error("يجب إدخال سعر وموعد تسليم صحيح لجميع المدن");
        return;
      }
    }

    const prices: ShippingPrice[] = selectedCityIds.map((cityId) => {
      const existingPrice = editingCompany?.prices.find((p) => p.city_id === cityId);
      return {
        id: existingPrice?.id, 
        city_id: cityId,
        days: shippingPrices[cityId].days,
        price: shippingPrices[cityId].price,
      };
    });

    const company: ShippingCompany = {
      id: editingCompany?.id,
      name: storeName,
      phone: `${phoneCountryCode}${storePhone}`,
      prices,
    };

    onSave(company);
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };

  const updateShippingPrice = (
    cityId: number,
    field: keyof PriceData,
    value: number
  ) => {
    setShippingPrices((prev) => ({
      ...prev,
      [cityId]: {
        ...prev[cityId],
        [field]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center ">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">إضافة بيانات شركة الشحن</h2>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 ? (
            <div className="space-y-6">
              <FormInput
                label="اسم ملف الشحن"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="اكتب اسم الملف هنا"
                className="rounded-full h-10"
              />

              <div className="space-y-4">
                <h3 className="font-medium">المدن التي ترسل لها المنتجات؟</h3>
                <div className="space-y-3">
                  {cities.map((city) => {
                    const isSelected = selectedCityIds.includes(city.id);
                    return (
                      <div
                        key={city.id}
                        onClick={() => handleCityToggle(city.id)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <button
                          type="button"
                          className={cn(
                            "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer",
                            isSelected
                              ? "bg-blue-5 border-blue-4"
                              : "bg-white border-gray-300 group-hover:border-gray-500"
                          )}
                          aria-checked={isSelected}
                          role="checkbox"
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-blue-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <span className="text-sm font-medium">{city.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center items-center pt-6">
                <Button
                  onClick={handleStep1Next}
                  className="px-12 py-5 rounded-full text-white bg-[#3A5779] hover:bg-[#2c425e]"
                >
                  التالي
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold">
                  المدن التي ترسل لها المنتجات؟
                </h3>

                {selectedCityIds.map((cityId) => {
                  const city = cities.find((c) => c.id === cityId);
                  if (!city) return null;

                  return (
                    <div key={cityId} className="grid grid-cols-8 gap-4 items-end border-b border-gray-100 pb-4 last:border-0">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-2">
                          المدينة
                        </label>
                        <div className="text-sm font-medium h-[38px] flex items-center text-gray-700">
                          {city.name}
                        </div>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-2">
                          موعد التسليم (بالأيام) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={shippingPrices[cityId]?.days || 3}
                          onChange={(e) =>
                            updateShippingPrice(cityId, "days", parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-2 border text-sm border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3A5779] transition-shadow"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-2">
                          سعر التوصيل <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingPrices[cityId]?.price || 20.0}
                          onChange={(e) =>
                            updateShippingPrice(cityId, "price", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-4 py-2 border text-sm border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3A5779] transition-shadow"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <FormInput
                  label="اسم شركة الشحن"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="أدخل اسم الشركة"
                  className="h-10 rounded-full"
                />

                <PhoneNumberInput
                  label="رقم الهاتف"
                  placeholder="01289022985"
                  countryCode={phoneCountryCode}
                  onCountryCodeChange={setPhoneCountryCode}
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="rounded-full h-10"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  • المدن التي لن يتم إضافتها في الملف لا تستطيع الشراء منك
                </p>
              </div>

              <div className="flex justify-end items-center pt-6">
                <Button
                  onClick={handleStep2Submit}
                  className="px-12 py-5 rounded-full text-white bg-[#3A5779] hover:bg-[#2c425e]"
                >
                  تأكيد
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}