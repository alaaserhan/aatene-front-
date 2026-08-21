"use client";

import ServiceCard from "./ServiceCard";
import { Service } from "../api";

export default function ServicesChooseForYou({
  services,
}: {
  services: Service[];
}) {
  if (!services || services.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="heading-lg">تم اختياره لأجلك</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
