"use client";

import { Calendar, Truck, Package, Pencil, Phone, Building2 } from "lucide-react";
import { Product, Store, ShippingCompany, ShippingDetails } from "../types";

interface ShippingPoliciesProps {
    product: Product;
    store: Store;
    shippingCompany?: ShippingCompany | null;
    shippingDetails?: ShippingDetails | null;
}

export default function ShippingPolicies({ product, store, shippingCompany, shippingDetails }: ShippingPoliciesProps) {
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
                        <span className="font-medium ">التوصيل إلى: <span className="underline decoration-blue-3 underline-offset-4 cursor-pointer">الناصرة</span></span>
                        <button className="text-blue-3 hover:opacity-80 transition-opacity">
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
        </div>
    );
}
