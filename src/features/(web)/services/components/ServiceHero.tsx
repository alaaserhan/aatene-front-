"use client";

import { useState, useMemo } from "react";
import { Star, Share2, Flag, ChevronLeft, ChevronRight, Phone, MoreVertical, Send, Check, Clock4 } from "lucide-react";
import { Service } from "../api";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { useAddServiceToCompare } from "@/src/features/(web)/compares/hooks";
import { cn } from "@/src/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ReportAbuseModal } from "../../reports/components/ReportAbuseModal";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

interface ServiceHeroProps {
    service: Service;
}

export default function ServiceHero({ service }: ServiceHeroProps) {
    const allMedia = useMemo(() => {
        const items: { type: "image" | "video"; url: string }[] = [];
        if (service.images_urls && service.images_urls.length > 0) {
            service.images_urls.forEach((img) => items.push({ type: "image", url: img }));
        } else if (service.image_url) {
            items.push({ type: "image", url: service.image_url });
        }
        return items;
    }, [service]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
    const [isReportOpen, setIsReportOpen] = useState(false);

    const qc = useQueryClient();
    const { mutate: addToCompare } = useAddServiceToCompare();

    const currentMedia = allMedia[selectedIndex] || allMedia[0];
    const rating = parseFloat(service.review_rate || "0");
    const reviewCount = parseInt(service.review_count || "0");

    // Calculate total price with extras
    const basePrice = parseFloat(service.price || "0");

    const extrasTotal = selectedExtras.reduce((sum, id) => {
        const extra = service.extras?.find(e => e.id === id);
        return sum + (extra ? parseFloat(extra.price) : 0);
    }, 0);

    const totalPrice = basePrice + extrasTotal;

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
    };

    const toggleExtra = (id: number) => {
        setSelectedExtras(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm">
                <span className="text-gray-500">قائمة الخدمات</span>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{service.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Right Side: Image Gallery */}
                <div className="flex flex-col-reverse lg:flex-row gap-3 lg:w-[55%]">
                    {/* Thumbnails Strip */}
                    {allMedia.length > 1 && (
                        <div className="flex gap-2.5 overflow-auto shrink-0 flex-row w-full h-[100px] lg:flex-col lg:w-[100px] lg:h-auto lg:max-h-[600px]">
                            {allMedia.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={cn(
                                        "relative w-[100px] h-[100px] rounded-md overflow-hidden shrink-0 border-2 transition-colors",
                                        selectedIndex === index
                                            ? "border-[#046cff]"
                                            : "border-transparent hover:border-gray-300"
                                    )}
                                >
                                    <img
                                        src={item.url}
                                        alt={`${service.title} - ${index + 1} `}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.png";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                        <img
                            src={currentMedia?.url || "/placeholder.png"}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.png";
                            }}
                        />

                        {/* Navigation Arrows */}
                        {allMedia.length > 1 && (
                            <>
                                <button
                                    onClick={handleNext}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/60 shadow-lg flex items-center justify-center hover:bg-white/80 transition-colors backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                    onClick={handlePrev}
                                    className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/60 shadow-lg flex items-center justify-center hover:bg-white/80 transition-colors backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Left Side: Service Info */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Price & Rating Row */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-normal">
                                {totalPrice.toFixed(2)} ₪
                            </span>
                            <div className="w-px h-4 bg-gray-300 mx-2" />
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4",
                                            i < Math.round(rating)
                                                ? "fill-[#FB923C] text-[#FB923C]"
                                                : "fill-gray-200 text-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-2">
                                ( {reviewCount} مراجعة )
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-2xl font-medium leading-relaxed">
                            {service.title}
                        </h1>
                        <div className="flex items-center gap-2 shrink-0">
                            <FavoriteButton
                                id={service.id}
                                type="service"
                                isFavorite={service.is_favorite}
                                className="w-8 h-8 rounded-full"
                                iconClassName="w-5 h-5"
                                onSuccess={() => {
                                    qc.invalidateQueries({ queryKey: ["service", service.slug] });
                                    qc.invalidateQueries({ queryKey: ["service", service.id] }); // Invalidate both ID and Slug variants just in case
                                }}
                            />
                            {/* More menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                {showMenu && (
                                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-30">
                                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                            مشاركة المنتج
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsReportOpen(true);
                                                setShowMenu(false);
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Flag className="w-4 h-4" />
                                            ابلاغ عن الخدمة
                                        </button>
                                    </div>
                                )}
                            </div>

                            <ReportAbuseModal
                                isOpen={isReportOpen}
                                onClose={() => setIsReportOpen(false)}
                                type="service"
                                id={service.id}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full" />

                    {/* Extras Section */}
                    {service.extras && service.extras.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-medium text-blue-3">تطويرات اختيارية</h3>
                            <div className="flex flex-col gap-2">
                                {service.extras.map((extra) => (
                                    <div
                                        key={extra.id}
                                        className={cn(
                                            "border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors",
                                            selectedExtras.includes(extra.id) ? "border-blue-4 bg-blue-5" : "border-gray-200 hover:border-gray-300"
                                        )}
                                        onClick={() => toggleExtra(extra.id)}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                            selectedExtras.includes(extra.id) ? "bg-blue-4 border-none" : "border-gray-200 bg-white"
                                        )}>
                                            {selectedExtras.includes(extra.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-sm">{extra.title}</span>
                                            <div className="flex items-center gap-4 text-xs text-gray-2">
                                                <span className="font-medium text-gray-2  ">
                                                    {parseFloat(extra.price).toFixed(2)} <span className="text-base">₪ </span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock4 className="w-3 h-3" /> {extra.execute_count} {extra.execute_type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Specialties / Field Dropdown */}
                    {service.specialties && service.specialties.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <ReusableDropdown
                                placeholder="اختر المجال"
                                options={service.specialties.map(spec => ({
                                    value: spec.id.toString(),
                                    label: spec.title
                                }))}
                                value={selectedSpecialty}
                                onChange={setSelectedSpecialty}
                            />
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3">
                        {service.store?.phone && (
                            <a
                                href={`tel:${service.store.phone} `}
                                className="flex items-center justify-center gap-2 bg-blue-3 text-white h-11 rounded-full font-medium hover:opacity-90 transition-opacity"
                            >
                                <span dir="ltr">{service.store.phone?.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "+$1 *** *** ***")}</span>
                                <Phone className="w-5 h-5" />
                            </a>
                        )}

                        <button className="flex items-center justify-center gap-2 bg-white border border-blue-3 text-blue-3 h-11 cursor-pointer rounded-full font-medium  hover:bg-gray-50 transition-colors">
                            دردش
                            <Send className="w-5 h-5" />
                        </button>

                        {/* Compare Link */}
                        {!service.in_compare && (
                            <button
                                onClick={() => addToCompare(service.id, {
                                    onSuccess: () => {
                                        qc.invalidateQueries({ queryKey: ["service", service.slug] });
                                        qc.invalidateQueries({ queryKey: ["service", service.id] });
                                    }
                                })}
                                className="text-blue-4 text-sm font-medium underline underline-offset-4 cursor-pointer"
                            >
                                أضف الى المقارنة
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
