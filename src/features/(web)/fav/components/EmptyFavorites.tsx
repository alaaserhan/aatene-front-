"use client";

import Image from "next/image";

export default function EmptyFavorites() {
    return (
        <div className="flex flex-col items-center justify-center p-8  min-h-[400px]">
            <div className="mb-6">
                <Image
                    src="/icons/dashboard/empty2.svg"
                    alt="No favorites"
                    width={280}
                    height={280}
                />
            </div>
            <h3 className="text-blue-3 text-xl font-bold mb-2">
                لا توجد منتجات مفضلة بعد
            </h3>
            <p className="text-gray-2 text-center max-w-md mb-6">
                ابدأ بإضافة منتجاتك المفضلة أو أنشئ مجموعة جديدة لتنظيمها بسهولة، وارجع
                إليها وقت ما تحتاج.
            </p>
        </div>
    );
}
