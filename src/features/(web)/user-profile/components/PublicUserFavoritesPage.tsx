"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, UserPlus, UserMinus, User as UserIcon, Search, ShoppingBag, Store as StoreIcon, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { getUserProfile } from "../api";
import { searchProducts, searchServices, searchStores } from "../../searchAndFilter/api";
import { useFollowUserOrStore, useUnfollowUserOrStore } from "../../settings/hooks";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { loginUrlWithAuthRequired } from "@/src/lib/auth-links";
import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import ProductCard from "../../product/components/ProductCard";
import StoreCard from "../../stores/components/StoreCard";
import { Pagination } from "@/src/components/ui/Pagination";

// -----------------------------------------------
// Types
// -----------------------------------------------
type ActiveTab = "all" | "products" | "stores" | "services";

const PER_PAGE = 12;

// -----------------------------------------------
// ServiceCard mini (inline — reuse style of ProductCard)
// -----------------------------------------------
function ServiceCardMini({ service }: { service: any }) {
    const imageUrl = service.image_url || service.images_urls?.[0] || "/placeholder.png";
    return (
        <Link
            href={`/service/${service.slug}`}
            className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow"
        >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                />
            </div>
            <div className="p-3 flex flex-col gap-1">
                <p className="font-medium text-sm line-clamp-2 text-gray-800">{service.title}</p>
                {service.store?.name && (
                    <p className="text-xs text-gray-400 truncate">{service.store.name}</p>
                )}
                <p className="text-blue-4 font-semibold text-sm mt-1">{formatPrice(service.price)} ₪</p>
            </div>
        </Link>
    );
}

// -----------------------------------------------
// Main Page
// -----------------------------------------------
export default function PublicUserFavoritesPage() {
    const params = useParams();
    const slugOrId = params.slugOrId as string;
    const lang = useLanguage();
    const router = useRouter();
    const { user: authUser } = useAuthStore();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<ActiveTab>("products");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);

    // --- Fetch profile ---
    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ["userProfile", "detail", slugOrId],
        queryFn: () => getUserProfile(slugOrId),
        enabled: !!slugOrId,
    });

    const user = profileData?.user;

    // --- Follow/Unfollow ---
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();

    const handleFollowToggle = () => {
        if (!authUser) {
            router.push(loginUrlWithAuthRequired(lang));
            return;
        }
        if (!user) return;
        const onSuccess = () => queryClient.invalidateQueries({ queryKey: ["userProfile", "detail", slugOrId] });
        if (user.is_following) {
            unfollow({ followed_type: "user", followed_id: user.id }, { onSuccess });
        } else {
            follow({ followed_type: "user", followed_id: user.id }, { onSuccess });
        }
    };

    // --- Fetch favorites by type ---
    const isProducts = activeTab === "products" || activeTab === "all";
    const isStores = activeTab === "stores" || activeTab === "all";
    const isServices = activeTab === "services" || activeTab === "all";

    const userId = user?.id;

    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ["publicFavProducts", userId, page, search],
        queryFn: () => searchProducts({ fav_by_id: userId, page, per_page: PER_PAGE, search: search || undefined }),
        enabled: !!userId && (activeTab === "products" || activeTab === "all"),
    });

    const { data: servicesData, isLoading: isLoadingServices } = useQuery({
        queryKey: ["publicFavServices", userId, page, search],
        queryFn: () => searchServices({ fav_by_id: userId, page, per_page: PER_PAGE, search: search || undefined }),
        enabled: !!userId && (activeTab === "services" || activeTab === "all"),
    });

    const { data: storesData, isLoading: isLoadingStores } = useQuery({
        queryKey: ["publicFavStores", userId, page, search],
        queryFn: () => searchStores({ fav_by_id: userId, page, per_page: PER_PAGE, search: search || undefined }),
        enabled: !!userId && (activeTab === "stores" || activeTab === "all"),
    });

    const products = productsData?.products || [];
    const services = servicesData?.services || [];
    const stores = storesData?.stores || [];

    const totalProducts = productsData?.total || 0;
    const totalServices = servicesData?.total || 0;
    const totalStores = storesData?.total || 0;

    const totalPages = activeTab === "products"
        ? Math.ceil(totalProducts / PER_PAGE)
        : activeTab === "services"
            ? Math.ceil(totalServices / PER_PAGE)
            : activeTab === "stores"
                ? Math.ceil(totalStores / PER_PAGE)
                : 1;

    const isLoading = isLoadingProducts || isLoadingServices || isLoadingStores;

    const handleTabChange = (tab: ActiveTab) => {
        setActiveTab(tab);
        setPage(1);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    // -----------------------------------------------
    // Render
    // -----------------------------------------------
    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
                لم يتم العثور على المستخدم
            </div>
        );
    }

    const isOwnProfile = authUser?.id === user.id;
    const profileId = user.slug || String(user.id);

    const sidebarItems = [
        { tab: "all" as ActiveTab, label: "جميع العناصر", icon: <ShoppingBag className="w-4 h-4" />, count: totalProducts + totalServices + totalStores },
        { tab: "products" as ActiveTab, label: "المنتجات المفضلة", icon: <ShoppingBag className="w-4 h-4" />, count: totalProducts },
        { tab: "stores" as ActiveTab, label: "المتاجر المفضلة", icon: <StoreIcon className="w-4 h-4" />, count: totalStores },
        { tab: "services" as ActiveTab, label: "الخدمات المفضلة", icon: <Wrench className="w-4 h-4" />, count: totalServices },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-16" dir="rtl">

            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-100 py-8">
                <div className="container">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        {/* Avatar */}
                        <Link href={`/profile/${profileId}`} className="shrink-0">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 relative flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-gray-400 absolute" />
                                {user.avatar_url && (
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.fullname}
                                        fill
                                        className="object-cover z-10"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                    />
                                )}
                            </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-right">
                            <h1 className="text-2xl font-bold text-gray-900">
                                المفضلة {user.fullname}
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                احفظ منتجاتك ومحلاتك المفضلة في مكان واحد، وارجع لها وقت ما تحتاج بسهولة.
                            </p>
                        </div>

                        {/* Actions */}
                        {!isOwnProfile && (
                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isFollowing || isUnfollowing}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50",
                                        user.is_following
                                            ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            : "bg-blue-4 text-white hover:bg-blue-3"
                                    )}
                                >
                                    {(isFollowing || isUnfollowing) ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : user.is_following ? (
                                        <UserMinus className="w-4 h-4" />
                                    ) : (
                                        <UserPlus className="w-4 h-4" />
                                    )}
                                    {user.is_following ? "إلغاء المتابعة" : "متابعة"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="container mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">

                    {/* ── Sidebar ── */}
                    <aside className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-4">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.tab}
                                onClick={() => handleTabChange(item.tab)}
                                className={cn(
                                    "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-none cursor-pointer",
                                    activeTab === item.tab
                                        ? "bg-blue-4 text-white"
                                        : "text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                <span className={cn(
                                    "text-xs rounded-full px-2 py-0.5",
                                    activeTab === item.tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                )}>
                                    {item.count}
                                </span>
                            </button>
                        ))}
                    </aside>

                    {/* ── Main content ── */}
                    <div className="flex flex-col gap-4">

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="ابحث في المفضلة..."
                                className="w-full h-11 pl-4 pr-12 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-4 transition-colors"
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-4 transition-colors cursor-pointer">
                                <Search className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Loading */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
                            </div>
                        ) : (
                            <>
                                {activeTab === "all" && (
                                    <>
                                        {products.length > 0 && (
                                            <section>
                                                <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                                                    المنتجات المفضلة
                                                    <span className="text-sm font-normal text-gray-400 mr-2">
                                                        ({totalProducts})
                                                    </span>
                                                </h2>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                                    {products.map((p) => (
                                                        <ProductCard
                                                            key={p.id}
                                                            id={p.id}
                                                            name={p.name}
                                                            slug={p.slug}
                                                            cover={p.cover || "/placeholder.png"}
                                                            price={p.price}
                                                            priceAfterDiscount={p.price_after_discount}
                                                            discountPercent={p.discount_present}
                                                            reviewRate={p.review_rate}
                                                            reviewCount={p.review_count}
                                                            isFavorite={true}
                                                            storeId={p.store_id}
                                                        />
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                        {services.length > 0 && (
                                            <section className={products.length > 0 ? "mt-8" : ""}>
                                                <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                                                    الخدمات المفضلة
                                                    <span className="text-sm font-normal text-gray-400 mr-2">
                                                        ({totalServices})
                                                    </span>
                                                </h2>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                                    {services.map((s) => (
                                                        <ServiceCardMini key={s.id} service={s} />
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                        {stores.length > 0 && (
                                            <section
                                                className={
                                                    products.length > 0 || services.length > 0 ? "mt-8" : ""
                                                }
                                            >
                                                <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                                                    المتاجر المفضلة
                                                    <span className="text-sm font-normal text-gray-400 mr-2">
                                                        ({totalStores})
                                                    </span>
                                                </h2>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                    {stores.map((store) => (
                                                        <StoreCard key={store.id} store={store} />
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                        {products.length === 0 &&
                                            services.length === 0 &&
                                            stores.length === 0 && (
                                                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
                                                    لا توجد عناصر في المفضلة
                                                </div>
                                            )}
                                    </>
                                )}

                                {activeTab === "products" && (
                                    <section>
                                        {products.length === 0 ? (
                                            <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
                                                لا توجد منتجات مفضلة
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {products.map((p) => (
                                                    <ProductCard
                                                        key={p.id}
                                                        id={p.id}
                                                        name={p.name}
                                                        slug={p.slug}
                                                        cover={p.cover || "/placeholder.png"}
                                                        price={p.price}
                                                        priceAfterDiscount={p.price_after_discount}
                                                        discountPercent={p.discount_present}
                                                        reviewRate={p.review_rate}
                                                        reviewCount={p.review_count}
                                                        isFavorite={true}
                                                        storeId={p.store_id}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {activeTab === "services" && (
                                    <section>
                                        {services.length === 0 ? (
                                            <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
                                                لا توجد خدمات مفضلة
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {services.map((s) => (
                                                    <ServiceCardMini key={s.id} service={s} />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {activeTab === "stores" && (
                                    <section>
                                        {stores.length === 0 ? (
                                            <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
                                                لا توجد متاجر مفضلة
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {stores.map((store) => (
                                                    <StoreCard key={store.id} store={store} />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {/* Pagination (single-type tabs only) */}
                                {activeTab !== "all" && totalPages > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <Pagination
                                            totalPages={totalPages}
                                            currentPage={page}
                                            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
