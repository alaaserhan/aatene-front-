"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Phone, Building2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { DeliveryType, Product, Store, ShippingCompany, ShippingDetails, ShippingPrice } from "../types";
import { useGetCities } from "@/src/features/(web)/settings/hooks";
import { formatPrice } from "@/src/lib/format-price";
import { cn } from "@/src/lib/utils";

interface ShippingPoliciesProps {
    product: Product;
    store: Store;
    shippingCompany?: ShippingCompany | null;
    shippingDetails?: ShippingDetails | null;
    allShippingCompanies?: ShippingCompany[] | null;
    deliveryType?: DeliveryType | null;
    onCityChange?: (city: { id: number; name: string }) => void;
    className?: string;
}

export default function ShippingPolicies({
    shippingCompany,
    shippingDetails,
    allShippingCompanies,
    deliveryType,
    onCityChange,
    className,
}: ShippingPoliciesProps) {
    const { data: citiesData } = useGetCities();
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedCityName, setSelectedCityName] = useState("الناصرة");
    const [tempSelectedCityId, setTempSelectedCityId] = useState<number | null>(null);
    const [showPhone, setShowPhone] = useState(false);

    const hasShippingData = Boolean(
        shippingCompany ||
        shippingDetails ||
        (allShippingCompanies && allShippingCompanies.length > 0)
    );
    const isShippingDelivery = deliveryType ? deliveryType === "shipping" : hasShippingData;

    useEffect(() => {
        if (!isShippingDelivery) setIsCityModalOpen(false);
    }, [isShippingDelivery]);

    useEffect(() => {
        if (!isShippingDelivery) return;

        if (typeof window !== "undefined") {
            const savedCity = localStorage.getItem("selected_delivery_city");
            if (savedCity) {
                try {
                    const parsed = JSON.parse(savedCity) as { id: number; name: string };
                    setSelectedCityId(parsed.id);
                    setSelectedCityName(parsed.name);
                    return;
                } catch {
                    return;
                }
            }
        }
        if (shippingDetails?.city?.id) {
            setSelectedCityId(Number(shippingDetails.city.id));
            setSelectedCityName(shippingDetails.city.name);
        }
    }, [isShippingDelivery, shippingDetails?.city?.id, shippingDetails?.city?.name]);

    useEffect(() => {
        setShowPhone(false);
    }, [shippingCompany?.id, selectedCityId]);

    const filteredCities = useMemo(() => {
        let cities = citiesData?.cities || [];

        if (isShippingDelivery && allShippingCompanies && allShippingCompanies.length > 0) {
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
    }, [citiesData?.cities, searchQuery, allShippingCompanies, isShippingDelivery]);

    const { activeCompany, activeDetails } = useMemo(() => {
        if (!isShippingDelivery) {
            return { activeCompany: null, activeDetails: null };
        }

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
    }, [allShippingCompanies, selectedCityId, shippingCompany, shippingDetails, selectedCityName, isShippingDelivery]);

    const deliveryCompanyName = getDisplayCompanyName(activeCompany?.name);
    const deliveryCompanyPhone = normalizeDisplayPhone(activeCompany?.phone);

    const openCityModal = () => {
        setTempSelectedCityId(selectedCityId);
        setIsCityModalOpen(true);
    };

    const handleApplyCity = () => {
        const city = citiesData?.cities?.find((c) => c.id === tempSelectedCityId);
        if (city) {
            setSelectedCityId(city.id);
            setSelectedCityName(city.name);
            onCityChange?.({ id: city.id, name: city.name });
            if (typeof window !== "undefined") {
                localStorage.setItem("selected_delivery_city", JSON.stringify({ id: city.id, name: city.name }));
            }
        }
        setIsCityModalOpen(false);
    };

    return (
        <div className={cn("white-card", className)}>
            <h2 className="mb-4 text-sm font-medium text-c2-navy-1000">تفاصيل الشحن</h2>

            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                {/* Carrier + destination */}
                <div className="flex flex-col gap-3">
                    {deliveryCompanyName ? (
                        <div className="flex items-center gap-2">
                            <span className="size-9 shrink-0 rounded-lg bg-c2-primary flex items-center justify-center">
                                <Building2 className="size-5 text-white" aria-hidden="true" />
                            </span>
                            <span className="text-sm font-medium text-c2-navy-1000">
                                {deliveryCompanyName}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-c2-neutral-700">
                            {isShippingDelivery ? "بدون شركات توصيل" : "تسليم من يد ليد"}
                        </span>
                    )}

                    {isShippingDelivery && (
                        <div className="flex items-center gap-2 text-sm text-c2-neutral-700">
                            <span>
                                التوصيل إلى:{" "}
                                <button
                                    type="button"
                                    onClick={openCityModal}
                                    className="cursor-pointer text-c2-primary underline underline-offset-4"
                                >
                                    {selectedCityName}
                                </button>
                            </span>
                            <button
                                type="button"
                                onClick={openCityModal}
                                aria-label="تعديل مدينة التوصيل"
                                className="size-6 shrink-0 rounded-md bg-c2-neutral-300-a10 flex items-center justify-center text-c2-primary transition-colors hover:bg-c2-neutral-200"
                            >
                                <Pencil className="size-3" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Carrier phone + timing */}
                <div className="flex flex-col items-end gap-3">
                    {deliveryCompanyPhone && (
                        <a
                            href={`tel:${deliveryCompanyPhone}`}
                            onClick={(e) => {
                                if (showPhone) return;
                                e.preventDefault();
                                setShowPhone(true);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-full border border-c2-primary/30 bg-c2-primary/5 px-4 py-1.5 text-sm font-medium text-c2-primary transition-colors hover:bg-c2-primary/10"
                        >
                            <span dir="ltr">
                                {showPhone ? deliveryCompanyPhone : maskDisplayPhone(deliveryCompanyPhone)}
                            </span>
                            <Phone className="size-4 fill-current" aria-hidden="true" />
                        </a>
                    )}

                    <p className="flex items-center gap-2 text-sm text-c2-neutral-700">
                        <span>
                            {isShippingDelivery
                                ? `يتم التوصيل خلال ${activeDetails?.days || "1-4"} أيام`
                                : "يتم الاتفاق على التسليم مع المتجر"}
                        </span>
                        {isShippingDelivery && (
                            <span className="font-medium text-c2-navy-1000">
                                {!activeCompany || String(activeDetails?.price) === "0"
                                    ? "توصيل مجاني"
                                    : `${formatPrice(activeDetails?.price)} ₪`}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <Dialog open={isShippingDelivery && isCityModalOpen} onOpenChange={(open) => {
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

function normalizeDisplayPhone(phone: unknown): string {
    if (phone == null) return "";
    const value = String(phone).trim();
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 4) return "";
    return value;
}

function getDisplayCompanyName(name: unknown): string {
    if (typeof name !== "string") return "";
    const value = name.trim();
    const normalized = value.replace(/\s+/g, " ");
    if (!normalized || normalized === "شركة شحن") return "";
    return value;
}

function maskDisplayPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 6) return phone;
    return phone.replace(/^\+?(\d{3}).*/, "+$1 *** ***");
}
