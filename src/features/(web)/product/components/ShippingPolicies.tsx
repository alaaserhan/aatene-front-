"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Truck, Package, Pencil, Phone, Building2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Product, Store, ShippingCompany, ShippingDetails } from "../types";
import { useGetCities } from "@/src/features/(web)/settings/hooks";

interface ShippingPoliciesProps {
    product: Product;
    store: Store;
    shippingCompany?: ShippingCompany | null;
    shippingDetails?: ShippingDetails | null;
}

export default function ShippingPolicies({ product, store, shippingCompany, shippingDetails }: ShippingPoliciesProps) {
    const { data: citiesData } = useGetCities();
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedCityName, setSelectedCityName] = useState("الناصرة");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCity = localStorage.getItem("selected_delivery_city");
            if (savedCity) {
                try {
                    const parsed = JSON.parse(savedCity) as { id: number; name: string };
                    setSelectedCityId(parsed.id);
                    setSelectedCityName(parsed.name);
                    return;
                } catch {
                    // ignore malformed storage
                }
            }
        }
        if (shippingDetails?.city?.id) {
            setSelectedCityId(Number(shippingDetails.city.id));
            setSelectedCityName(shippingDetails.city.name);
        }
    }, [shippingDetails]);

    const filteredCities = useMemo(() => {
        const cities = citiesData?.cities || [];
        return cities.filter((city) => {
            if (!city.is_active) return false;
            if (!searchQuery.trim()) return true;
            return city.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
        });
    }, [citiesData?.cities, searchQuery]);

    const handleApplyCity = () => {
        const city = citiesData?.cities?.find((c) => c.id === selectedCityId);
        if (city) {
            setSelectedCityName(city.name);
            if (typeof window !== "undefined") {
                localStorage.setItem("selected_delivery_city", JSON.stringify({ id: city.id, name: city.name }));
            }
        }
        setIsCityModalOpen(false);
    };

    return (
        <div className="mt-8 flex flex-col gap-6">
            {/* Title */}
            {/* <h2 className="text-lg font-medium">
                تفاصيل الشحن والسياسات
            </h2> */}

            {/* Info Row */}
            <div className="flex flex-wrap items-center justify-between gap-6 md:gap-12 text-gray-2 text-sm">
                {/* Delivery Time */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center">
                        <img src="/icons/dashboard/calender.svg" alt="calendar" width={24} height={24} />
                    </div>
                    <span className="font-medium ">
                        يتم التوصيل خلال {shippingDetails?.days || "1-4"} أيام
                    </span>
                </div>

                {/* Free Shipping */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center">
                        <img src="/icons/car.svg" alt="calendar" width={24} height={24} />
                    </div>
                    <span className="font-medium ">
                        {(!shippingCompany || shippingDetails?.price === "0") ? "توصيل مجاني" : `توصيل: ${shippingDetails?.price} ج.م`}
                    </span>
                </div>

                {/* Delivery Location */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center">
                        <img src="/icons/box.svg" alt="calendar" width={30} height={30} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium ">التوصيل إلى: <span className="underline decoration-blue-3 underline-offset-4 cursor-pointer" onClick={() => setIsCityModalOpen(true)}>{selectedCityName}</span></span>
                        <button
                            className="text-blue-3 hover:opacity-80 transition-opacity"
                            onClick={() => setIsCityModalOpen(true)}
                            aria-label="تعديل مدينة التوصيل"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delivery Company Card */}
            {(shippingCompany || store) && (
                <div className="flex items-center justify-between flex-wrap gap-4 border border-gray-200 rounded-md p-3 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-md bg-blue-4 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-700 text-lg">
                            {shippingCompany?.name || "شركة مرسال للتوصيل"}
                        </span>
                    </div>

                    <a
                        href={`tel:${shippingCompany?.phone || store.phone}`}
                        className="flex items-center gap-3 bg-[#EFF6FF] text-blue-4 px-6 py-2 rounded-full text-sm font-bold border border-blue-4 transition-colors hover:bg-blue-100"
                    >
                        <span dir="ltr">{(shippingCompany?.phone || store.phone || "").replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1 *** *** ***")}</span>
                        <Phone className="w-4 h-4 fill-current" />
                    </a>
                </div>
            )}

            <Dialog open={isCityModalOpen} onOpenChange={setIsCityModalOpen}>
                <DialogContent className="sm:max-w-[520px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">اختر المدينة التي تريد التوصيل إليها</DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن مدينة"
                                className="w-full h-10 rounded-md border border-gray-200 pr-10 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-3"
                            />
                        </div>

                        <div className="max-h-[260px] overflow-y-auto">
                            {filteredCities.length === 0 && (
                                <div className="p-4 text-sm text-gray-500 text-center">لا توجد مدن مطابقة</div>
                            )}
                            {filteredCities.map((city) => (
                                <label key={city.id} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="shipping-city"
                                        checked={selectedCityId === city.id}
                                        onChange={() => setSelectedCityId(city.id)}
                                        className="accent-blue-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{city.name}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCityModalOpen(false)}
                                className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyCity}
                                className="px-6 py-2 text-sm rounded-md bg-blue-3 text-white hover:bg-blue-4"
                                disabled={!selectedCityId}
                            >
                                تأكيد
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
