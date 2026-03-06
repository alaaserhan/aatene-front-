"use client";

import { User } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { Star, MapPin, Crown, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserCardProps {
    user: User;
    className?: string;
}


export default function UserCard({ user, className }: UserCardProps) {
    const rating = parseFloat(user.review_rate || "0").toFixed(1);
    const cityName = user.city?.name || "لا يوجد مدينة";
    const coverImage = user.cover_url;

    const profileLink = `/profile/${user.slug || user.id}`;

    return (
        <Link
            href={profileLink}
            className={cn(
                "bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300 w-full max-w-[320px] mx-auto",
                className
            )}>
            {/* Cover Image */}
            <div className="relative h-32 w-full bg-gray-100">
                {
                    coverImage ? (
                        <Image
                            src={coverImage}
                            alt="Cover"
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-100" />
                    )
                }
            </div>

            {/* Content Section */}
            <div className="relative px-3 pb-3 pt-12 flex flex-col items-center text-center">

                {/* Profile Picture - Centered & Overlapping */}
                <div className="absolute -top-[2.5rem] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-[2px] border-white overflow-hidden shadow-sm bg-gray-100 z-10 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-gray-400 absolute" />
                    {user.avatar_url && (
                        <Image
                            src={user.avatar_url}
                            alt={user.name || "User"}
                            fill
                            className="object-cover z-10"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                </div>

                {/* Name & Crown */}
                <div className="flex items-center justify-center gap-2 mb-2 w-full px-4" dir="rtl">
                    <h3 className="font-semibold text-base truncate">{user.name}</h3>
                </div>

                {/* Bio / Job Title */}
                <p className="text-gray-500 text-xs font-medium mb-5 truncate w-full px-4" dir="rtl">
                    {user.bio || "لا يوجد وصف"}
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
