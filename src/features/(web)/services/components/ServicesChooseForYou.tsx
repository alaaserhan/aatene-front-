"use client";

import ServiceCard from "./ServiceCard";
import { Service } from "../api";

export default function ServicesChooseForYou({ services }: { services: Service[] }) {
    if (!services || services.length === 0) return null;

    return (
        <div className="my-8">
            <div className="mb-8">
                <h2 className="text-2xl font-medium mb-2">تم اختياره لأجلك</h2>
                <p className="text-gray-2 text-sm">خدمات مختارة بعناية لتلبية احتياجاتك</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </div>
    );
}
