"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Phone, Building2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Product, Store, ShippingCompany, ShippingDetails, ShippingPrice } from "../types";
import { useGetCities } from "@/src/features/(web)/settings/hooks";

interface ShippingPoliciesProps {
    product: Product;
    store: Store;
    shippingCompany?: ShippingCompany | null;
    shippingDetails?: ShippingDetails | null;
    allShippingCompanies?: ShippingCompany[] | null;
}

export default function ShippingPolicies({ product, store, shippingCompany, shippingDetails, allShippingCompanies }: ShippingPoliciesProps) {
    const { data: citiesData } = useGetCities();
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedCityName, setSelectedCityName] = useState("الناصرة");
    const [tempSelectedCityId, setTempSelectedCityId] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCity = localStorage.getItem("selected_delivery_city");
            if (savedCity) {
                try {
                    const parsed = JSON.parse(savedCity) as { id: number; name: string };
                    setSelectedCityId(parsed.id);
                    setSelectedCityName(parsed.name);
                    return;
                } catch {}
            }
        }
        if (shippingDetails?.city?.id) {
            setSelectedCityId(Number(shippingDetails.city.id));
            setSelectedCityName(shippingDetails.city.name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const [prevCityId, setPrevCityId] = useState<string | number | undefined>(shippingDetails?.city?.id);
    if (shippingDetails?.city?.id !== prevCityId) {
        setPrevCityId(shippingDetails?.city?.id);
        setSelectedCityId(Number(shippingDetails?.city?.id));
        setSelectedCityName(shippingDetails?.city?.name || "");
    }

    const filteredCities = useMemo(() => {
        let cities = citiesData?.cities || [];
        
        if (allShippingCompanies && allShippingCompanies.length > 0) {
            const validCityIds = new Set<string>();
            allShippingCompanies.forEach((company) => {
                company.prices.forEach((price) => {
                    if (price.city_id) {
                        validCityIds.add(String(price.city_id));
                    }
                });
            });
            cities = cities.filter((city) => validCityIds.has(String(city.id)));
        }

        return cities.filter((city) => {
            if (!city.is_active) return false;
            if (!searchQuery.trim()) return true;
            return city.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
        });
    }, [citiesData?.cities, searchQuery, allShippingCompanies]);

    const { activeCompany, activeDetails } = useMemo(() => {
        let activeC = shippingCompany;
        let activeD = shippingDetails;

        if (allShippingCompanies && selectedCityId) {
            let foundCompany: ShippingCompany | null = null;
            let foundPrice: ShippingPrice | null = null;

            for (const company of allShippingCompanies) {
                const priceMatch = company.prices.find((p) => Number(p.city_id) === Number(selectedCityId));
                if (priceMatch) {
                    foundCompany = company;
                    foundPrice = priceMatch;
                    break;
                }
            }

            if (foundCompany && foundPrice) {
                activeC = foundCompany;
                activeD = {
                    id: foundPrice.id,
                    city_id: String(foundPrice.city_id),
                    city: { id: selectedCityId, name: selectedCityName, is_active: true },
                    days: String(foundPrice.days),
                    price: String(foundPrice.price)
                };
            }
        }

        return { activeCompany: activeC, activeDetails: activeD };
    }, [allShippingCompanies, selectedCityId, shippingCompany, shippingDetails, selectedCityName]);

    const handleApplyCity = () => {
        const city = citiesData?.cities?.find((c) => c.id === tempSelectedCityId);
        if (city) {
            setSelectedCityId(city.id);
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
                        يتم التوصيل خلال {activeDetails?.days || "1-4"} أيام
                    </span>
                </div>

                {/* Free Shipping */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center">
                        <img src="/icons/car.svg" alt="calendar" width={24} height={24} />
                    </div>
                    <span className="font-medium ">
                        {(!activeCompany || String(activeDetails?.price) === "0") ? "توصيل مجاني" : `توصيل: ${activeDetails?.price} ج.م`}
                    </span>
                </div>

                {/* Delivery Location */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center">
                        <img src="/icons/box.svg" alt="calendar" width={30} height={30} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium ">التوصيل إلى: <span className="underline decoration-blue-3 underline-offset-4 cursor-pointer" onClick={() => { setTempSelectedCityId(selectedCityId); setIsCityModalOpen(true); }}>{selectedCityName}</span></span>
                        <button
                            className="text-blue-3 hover:opacity-80 transition-opacity"
                            onClick={() => { setTempSelectedCityId(selectedCityId); setIsCityModalOpen(true); }}
                            aria-label="تعديل مدينة التوصيل"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delivery Company Card */}
            {(activeCompany || store) && (
                <div className="flex items-center justify-between flex-wrap gap-4 border border-gray-200 rounded-md p-3 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-md bg-blue-4 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-700 text-lg">
                            {activeCompany?.name || "شركة مرسال للتوصيل"}
                        </span>
                    </div>

                    <a
                        href={`tel:${activeCompany?.phone || store.phone}`}
                        className="flex items-center gap-3 bg-[#EFF6FF] text-blue-4 px-6 py-2 rounded-full text-sm font-bold border border-blue-4 transition-colors hover:bg-blue-100"
                    >
                        <span dir="ltr">{(activeCompany?.phone || store.phone || "").replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1 *** *** ***")}</span>
                        <Phone className="w-4 h-4 fill-current" />
                    </a>
                </div>
            )}

            <Dialog open={isCityModalOpen} onOpenChange={(open) => {
                if (open) setTempSelectedCityId(selectedCityId);
                setIsCityModalOpen(open);
            }}>
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
                                        checked={tempSelectedCityId === city.id}
                                        onChange={() => setTempSelectedCityId(city.id)}
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
                                disabled={!tempSelectedCityId}
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
