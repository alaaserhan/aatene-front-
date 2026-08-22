"use client";

import Image from "next/image";

/** يطابق التبويب في صفحة المفضلة — لا نستورد من FavoritesPage لتجنب اعتماد دائري */
export type EmptyFavoritesTab = "all" | "product" | "store" | "service" | "blog";

interface EmptyFavoritesProps {
    type?: EmptyFavoritesTab;
}

const COPY: Record<
    EmptyFavoritesTab,
    { title: string; description: string }
> = {
    all: {
        title: "لا توجد عناصر في المفضلة بعد",
        description:
            "ابدأ بإضافة منتجات أو متاجر أو خدمات إلى المفضلة، أو أنشئ مجموعة جديدة لتنظيمها بسهولة.",
    },
    product: {
        title: "لا توجد منتجات مفضلة بعد",
        description:
            "أضف منتجاتك المفضلة أو أنشئ مجموعة جديدة لتنظيمها، وارجع إليها وقت ما تحتاج.",
    },
    store: {
        title: "لا توجد متاجر مفضلة بعد",
        description:
            "احفظ المتاجر التي تهمك لتصل إليها بسرعة، أو أنشئ مجموعة لتنظيم المفضلة.",
    },
    service: {
        title: "لا توجد خدمات مفضلة بعد",
        description:
            "أضف الخدمات التي تهمك إلى المفضلة، أو أنشئ مجموعة جديدة لتنظيمها بسهولة.",
    },
    blog: {
        title: "لا توجد مدونات مفضلة بعد",
        description:
            "احفظ المقالات التي تعجبك لتقرأها لاحقًا، أو أنشئ مجموعة جديدة لتنظيمها بسهولة.",
    },
};

export default function EmptyFavorites({ type = "all" }: EmptyFavoritesProps) {
    const { title, description } = COPY[type] ?? COPY.all;

    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
            <div className="mb-6">
                <Image
                    src="/icons/dashboard/empty2.svg"
                    alt=""
                    width={280}
                    height={280}
                />
            </div>
            <h3 className="text-blue-3 text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-2 text-center max-w-md mb-6">{description}</p>
        </div>
    );
}
