"use client";

import { User } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { Star, MapPin, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserCardProps {
    user: User;
    className?: string;
}

// In a real app this would be in the user object
const USER_COVERS = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
];

export default function UserCard({ user, className }: UserCardProps) {
    const rating = parseFloat(user.review_rate || "0").toFixed(1);
    const cityName = user.city?.name || "الخليل";
    // Deterministic cover based on user ID or random
    const coverIndex = user.id ? user.id % USER_COVERS.length : 0;
    const coverImage = USER_COVERS[coverIndex];

    // Use slug if available, otherwise ID
    const profileLink = `/profile/${user.slug || user.id}`;

    const getValidImageSrc = (src: string | undefined | null, fallback: string) => {
        if (!src) return fallback;
        if (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')) return src;
        try {
            new URL(src);
            return src;
        } catch {
            return fallback;
        }
    };

    const validAvatar = getValidImageSrc(user.avatar_url, "/default-avatar.png");

    return (
        <Link
            href={profileLink}
            className={cn(
                "bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300 w-full max-w-[320px] mx-auto",
                className
            )}>
            {/* Cover Image */}
            <div className="relative h-32 w-full bg-gray-100">
                <Image
                    src={coverImage}
                    alt="Cover"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Content Section */}
            <div className="relative px-3 pb-3 pt-12 flex flex-col items-center text-center">

                {/* Profile Picture - Centered & Overlapping */}
                {/* Positioned absolute relative to this container. 
                    Top padding (pt-16) pushes content down.
                    Avatar is pulled up with negative top margin or absolute positioning from top of container.
                */}
                <div className="absolute -top-[2.5rem] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-[2px] border-white overflow-hidden shadow-sm bg-gray-50 z-10">
                    <Image
                        src={validAvatar}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "/default-avatar.png";
                        }}
                    />
                </div>

                {/* Name & Crown */}
                <div className="flex items-center justify-center gap-2 mb-2 w-full px-4" dir="rtl">
                    <h3 className="font-medium truncate">{user.name}</h3>
                </div>

                {/* Bio / Job Title */}
                <p className="text-gray-500 text-xs font-medium mb-5 truncate w-full px-4" dir="rtl">
                    {user.bio || "مهندس معماري وديكور داخلي"}
                </p>

                {/* Location & Rating Row */}
                <div className="flex items-center justify-center gap-4 text-xs w-full" dir="rtl">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium  pt-0.5" >{rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium ">{cityName}</span>
                    </div>


                </div>
            </div>
        </Link>
    );
}
