"use client";

import { Calendar, Truck, MapPin, Pencil, Phone, Building2 } from "lucide-react";
import { Product, Store } from "../api";

interface ShippingPoliciesProps {
    product: Product;
    store: Store;
}

export default function ShippingPolicies({ product, store }: ShippingPoliciesProps) {
    return (
        <div className="mt-10 flex flex-col gap-5">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900">
                تفاصيل الشحن والسياسات
            </h2>

            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-6 md:gap-10 text-sm text-gray-700">
                {/* Delivery Time */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>يتم التوصيل خلال 1-4 أيام</span>
                </div>

                {/* Free Shipping */}
                <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-gray-500" />
                    <span>توصيل مجاني</span>
                </div>

                {/* Delivery Location */}
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>التوصيل إلى: الناصرة</span>
                    <button className="text-blue-3 hover:opacity-80 transition-opacity">
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Delivery Company */}
            <div className="flex items-center justify-between flex-wrap gap-4 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-3 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-medium  text-lg">
                        شركة مرسال للتوصيل
                    </span>
                </div>

                {store.phone && (
                    <a
                        href={`tel:${store.phone}`}
                        className="flex items-center gap-2 bg-blue-5 text-blue-4 px-5 py-2 rounded-full text-sm font-medium border border-blue-1"
                    >
                        <span dir="ltr">{store.phone?.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "+$1 *** *** ***")}</span>
                        <Phone className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
}
