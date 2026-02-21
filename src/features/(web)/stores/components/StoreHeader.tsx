"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { StoreProfile } from "../api";
import { cn } from "@/src/lib/utils";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import {
    Heart,
    MessageCircle,
    Star,
    Truck,
    PackageCheck,
    MessageSquareText,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Loader2
} from "lucide-react";
import { useFollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { useAddToFavorites, useRemoveFromFavorites } from "@/src/features/(web)/fav/hooks";
import { useQueryClient } from "@tanstack/react-query";

interface StoreHeaderProps {
    store: StoreProfile;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
    const queryClient = useQueryClient();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: addFav, isPending: isAddingFav } = useAddToFavorites();
    const { mutate: removeFav, isPending: isRemovingFav } = useRemoveFromFavorites();
    const [isFav, setIsFav] = useState(store.is_favorite);
    const covers = store.cover_urls?.length ? store.cover_urls : ["/background.svg"];

    useEffect(() => {
        if (covers.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === covers.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [covers.length]);

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev === covers.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? covers.length - 1 : prev - 1));
    };

    const followersCount = Number(store.followers_count || 0);

    return (
        <div className="relative bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] pb-4">
            {/* Cover Slider */}
            <div className="relative h-48 md:h-[250px] lg:h-[300px] w-full overflow-hidden group">
                <Image
                    src={covers[currentImageIndex]}
                    alt="Store Cover"
                    fill
                    className="object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                {covers.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer text-white"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer text-white"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            {covers.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="relative container">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:justify-between items-center lg:items-end text-center lg:text-start" dir="rtl">

                    {/* Left/Main Column: Avatar & Meta Stats */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 lg:gap-8 -mt-16  z-10 w-full lg:w-auto flex-1">

                        {/* Column 1: Avatar & Meta Stats (UserHeader Style) */}
                        <div className="flex flex-col gap-3 items-center relative w-full lg:w-auto shrink-0">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] rounded-full border-2 -mt-10 border-white shadow-sm shrink-0 bg-gray-100 overflow-hidden relative">
                                    <Image
                                        src={store.logo_url || "/default-avatar.png"}
                                        alt={store.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Ratings & Followers */}
                            <div className="flex flex-row lg:flex-col items-center justify-center gap-6 lg:gap-3 mt-2 lg:mt-3 px-2">
                                {/* Stars */}
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-4 h-4 md:w-[18px] md:h-[18px]",
                                                    i < Math.round(Number(store.review_rate || 0))
                                                        ? "fill-[#FACC15] text-[#FACC15]"
                                                        : "fill-[#D4D4D8] text-[#D4D4D8]"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-500 text-xs md:text-sm font-medium">( {store.review_count || 0} مراجعة )</span>
                                </div>

                                {/* Mobile Divider */}
                                <div className="w-px h-8 bg-gray-200 block lg:hidden"></div>

                                {/* Followers */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex -space-x-2 md:-space-x-3 space-x-reverse">
                                        {/* Mock avatars mimicking UserHeader if followers are real */}
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100">
                                            <Image src="/default-avatar.png" fill className="object-cover" alt="follower" />
                                        </div>
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100">
                                            <Image src="/default-avatar.png" fill className="object-cover" alt="follower" />
                                        </div>
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100">
                                            <Image src="/default-avatar.png" fill className="object-cover" alt="follower" />
                                        </div>
                                    </div>
                                    <span className="text-gray-500 text-xs md:text-sm font-medium">{followersCount} متابع</span>
                                </div>
                            </div>
                        </div>

                        {/* Title & Description Column */}
                        <div className="flex flex-col items-center lg:items-start gap-1 pb-2 lg:mt-20">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{store.name}</h1>
                            {store.description && (
                                <p className="text-gray-500 text-sm max-w-lg leading-relaxed">{store.description}</p>
                            )}
                            {store.address && (
                                <p className="text-gray-400 text-xs mt-1">{store.address}</p>
                            )}

                            {/* Action Buttons Row */}
                            <div className="flex items-center justify-center lg:justify-start gap-2 mt-4 flex-wrap">
                                <button
                                    disabled={isFollowing}
                                    onClick={() => {
                                        follow(
                                            { followed_type: "store", followed_id: store.id },
                                            {
                                                onSuccess: () => {
                                                    queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                                                },
                                            }
                                        );
                                    }}
                                    className="h-10 px-6 rounded-full text-sm bg-blue-4 text-white font-medium flex items-center justify-center gap-2 hover:bg-blue-3 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>{store.am_i_following ? "إلغاء المتابعة" : "تابع المتجر"}</span>
                                </button>

                                <button className="h-10 px-6 rounded-full text-sm border border-blue-4 text-blue-4 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors cursor-pointer">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>الدردشة</span>
                                </button>

                                <button
                                    disabled={isAddingFav || isRemovingFav}
                                    onClick={() => {
                                        if (isFav) {
                                            removeFav(
                                                { favs_type: "store", favs_id: store.id },
                                                {
                                                    onSuccess: () => {
                                                        setIsFav(false);
                                                        queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                                                    },
                                                }
                                            );
                                        } else {
                                            addFav(
                                                { favs_type: "store", favs_id: String(store.id) },
                                                {
                                                    onSuccess: () => {
                                                        setIsFav(true);
                                                        queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                                                    },
                                                }
                                            );
                                        }
                                    }}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {(isAddingFav || isRemovingFav) ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                    ) : (
                                        <Heart className={cn("w-4 h-4", isFav ? "fill-red-500 text-red-500" : "text-gray-500")} />
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right features block (Left statically translated depending on dir=rtl) */}
                    <div className="flex flex-row   justify-center gap-2 md:gap-2 mt-6 lg:mt-0  shrink-0 overflow-x-auto w-full lg:w-auto px-4 lg:px-0">
                        <FeatureBox
                            icon={<Truck className="w-6 h-6 text-blue-4" />}
                            title="خدمة توصيل"
                            desc="يتميز بسجل حافل بالشحن في الوقت المحدد مع خدمة التتبع."
                        />
                        <FeatureBox
                            icon={<PackageCheck className="w-6 h-6 text-blue-4" />}
                            title="شحن سلس"
                            desc="يتميز بسجل دقيق في الوقت المحدد مع خدمة التتبع."
                        />
                        <FeatureBox
                            icon={<MessageSquareText className="w-6 h-6 text-blue-4" />}
                            title="ردود سريعة"
                            desc="يتميز بسجل حافل بالرد السريع على الرسائل."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureBox({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="flex flex-col items-center  text-center gap-2 w-[100px] md:w-[110px]">
            <div className="w-[70px] h-[70px] bg-gray-50 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div className="text-[11px]">
                <h4 className=" text-gray-2  mb-1">{title}</h4>
                <p className=" text-gray-400 leading-tight">{desc}</p>
            </div>
        </div>
    );
}
