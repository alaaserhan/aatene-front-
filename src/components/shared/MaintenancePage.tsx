"use client";

import Image from "next/image";

export function MaintenancePage() {
  return (
    <div className="relative flex-1 w-full flex flex-col items-center justify-center bg-transparent p-6 text-center py-20">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in zoom-in duration-700">


        {/* Maintenance Illustration */}
        <div className="relative w-full aspect-video max-w-lg mx-auto  ">
          <Image
            src="/maintenance/under-maintenance.png"
            alt="Site Under Maintenance"
            fill

            priority
          />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black-1">
            الموقع قيد التطوير
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            نعمل حاليًا على تطوير الموقع وإضافة ميزات جديدة لتحسين تجربتك وجعلها أكثر سلاسة وكفاءة.
          </p>
        </div>

      </div>

      {/* Background image */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none  overflow-hidden ">
        <Image
          src="/maintenance/bg-chat.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
