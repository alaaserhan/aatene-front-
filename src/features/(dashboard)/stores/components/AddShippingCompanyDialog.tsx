// src/features/(dashboard)/stores/components/AddShippingCompanyDialog.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { ShippingCompanyPayload, ShippingPricePayload } from "../api";
import { useGetCities } from "../../cities/hooks";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface AddShippingCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: ShippingCompanyPayload) => void;
  editingCompany?: ShippingCompanyPayload | null;
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
  const [companyName, setCompanyName] = useState("");
  const [selectedCityIds, setSelectedCityIds] = useState<number[]>([]);
  const [shippingPrices, setShippingPrices] = useState<Record<number, PriceData>>({});
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (editingCompany) {
        setCompanyName(editingCompany.name || "");
        setStoreName(editingCompany.name || "");
        setStorePhone(
          String(editingCompany.phone)
            .replace("+970", "")
            .replace("+20", "")
            .replace("+966", "")
            .replace("+971", "")
        );

        const cityIds = editingCompany.prices.map((p) => Number(p.city_id));
        setSelectedCityIds(cityIds);

        const pricesMap: Record<number, PriceData> = {};
        editingCompany.prices.forEach((p) => {
          const cityId = Number(p.city_id);
          pricesMap[cityId] = {
            days: Number(p.days),
            price: Number(p.price)
          };
        });
        setShippingPrices(pricesMap);

      } else {
        setCompanyName("");
        setStoreName("");
        setStorePhone("");
        setSelectedCityIds([]);
        setShippingPrices({});
      }
      setStep(1);
    }
  }, [isOpen, editingCompany]);

  const handleCityToggle = (cityId: number) => {
    setSelectedCityIds((prev) => {
      const newSelection = prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId];

      if (newSelection.length > 0 && errors.cities) {
        setErrors(prevErr => ({ ...prevErr, cities: "" }));
      }
      return newSelection;
    });
  };

  const handleStep1Next = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!companyName.trim()) {
      newErrors.companyName = "يجب إدخال اسم ملف الشحن";
      isValid = false;
    }

    if (selectedCityIds.length === 0) {
      newErrors.cities = "يجب اختيار مدينة واحدة على الأقل";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
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
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!storeName.trim()) {
      newErrors.storeName = "يجب إدخال اسم شركة الشحن";
      isValid = false;
    }

    if (!storePhone.trim()) {
      newErrors.storePhone = "يجب إدخال رقم الهاتف";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    for (const cityId of selectedCityIds) {
      const priceData = shippingPrices[cityId];
      if (!priceData || priceData.price < 0 || priceData.days <= 0) {
        toast.error("يجب إدخال سعر وموعد تسليم صحيح لجميع المدن");
        return;
      }
    }

    const prices: ShippingPricePayload[] = selectedCityIds.map((cityId) => ({
      city_id: cityId,
      days: shippingPrices[cityId].days,
      price: shippingPrices[cityId].price,
    }));

    const company: ShippingCompanyPayload = {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0" dir="rtl">
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors -mr-2"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <DialogTitle className="text-xl font-bold">
              {editingCompany ? "تعديل شركة الشحن" : "إضافة بيانات شركة الشحن"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <FormInput
                label="اسم ملف الشحن"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors({ ...errors, companyName: "" });
                }}
                placeholder="اكتب اسم الملف هنا"
                className="rounded-full h-10"
                error={errors.companyName}
              />

              <div className="space-y-4">
                <h3 className="font-medium">المدن التي ترسل لها المنتجات؟</h3>
                <div
                  className={cn(
                    "space-y-3 p-2 rounded-lg transition-colors",
                    errors.cities ? "border border-red-500 bg-red-50" : ""
                  )}
                >
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
                {errors.cities && (
                  <p className="text-xs text-red-500 mt-1">{errors.cities}</p>
                )}
              </div>

              <div className="flex items-center pt-6">
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
                    <div
                      key={cityId}
                      className="grid grid-cols-8 gap-4 items-end border-b border-gray-100 pb-4 last:border-0"
                    >
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
                          موعد التسليم (بالأيام){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={shippingPrices[cityId]?.days}
                          onChange={(e) =>
                            updateShippingPrice(
                              cityId,
                              "days",
                              e.target.value === "" ? 0 : parseInt(e.target.value)
                            )
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
                          value={shippingPrices[cityId]?.price}
                          onChange={(e) =>
                            updateShippingPrice(
                              cityId,
                              "price",
                              e.target.value === "" ? 0 : parseFloat(e.target.value)
                            )
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
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    if (errors.storeName) setErrors({ ...errors, storeName: "" });
                  }}
                  placeholder="أدخل اسم الشركة"
                  className="h-10 rounded-full"
                  error={errors.storeName}
                />

                <PhoneNumberInput
                  label="رقم الهاتف"
                  placeholder="000000000"
                  countryCode={phoneCountryCode}
                  onCountryCodeChange={setPhoneCountryCode}
                  value={storePhone}
                  onChange={(e) => {
                    setStorePhone(e.target.value);
                    if (errors.storePhone) setErrors({ ...errors, storePhone: "" });
                  }}
                  className="rounded-full h-10"
                  error={errors.storePhone}
                />
              </div>

              <div>
                <p className="text-xs text-gray-2">
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
      </DialogContent>
    </Dialog>
  );
}