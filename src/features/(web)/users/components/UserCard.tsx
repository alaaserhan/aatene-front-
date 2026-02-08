"use client";

import { User } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { Star, MapPin } from "lucide-react";
import Image from "next/image";

interface UserCardProps {
    user: User;
    className?: string;
}

export default function UserCard({ user, className }: UserCardProps) {
    // Determine rating color (yellow/orange)
    const starColor = "rgb(251, 146, 60)"; // Matches other cards

    return (
        <div className={cn("bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all duration-300", className)}>
            {/* Cover Image - Top Half */}
            <div className="relative h-48 w-full bg-gray-200">
                {/* We don't have a cover image in the User type, so we'll use a placeholder or avatar if available as fallback pattern */}
                <Image
                    src={"/placeholder-cover.jpg"} // Replace with actual placeholder or user.cover if added
                    alt="Cover"
                    fill
                    className="object-cover"
                    onError={(e) => {
                        // Fallback
                        e.currentTarget.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Cover";
                    }}
                />
            </div>

            {/* Content Section */}
            <div className="relative px-4 pb-6 pt-12 flex flex-col items-center text-center">
                {/* Profile Picture - Overlapping */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-sm bg-gray-50">
                    <Image
                        src={user.avatar || "/placeholder-user.jpg"}
                        alt={user.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/150x150/e5e7eb/a1a1aa?text=User";
                        }}
                    />
                </div>

                {/* Name & Crown */}
                <div className="flex items-center gap-2 mb-2 mt-2">
                    <h3 className="text-xl font-bold text-[#1F2A37]">{user.name}</h3>
                    {/* Assuming we might want to show a crown for some users, but no field in API yet. 
                        Image shows a gold crown. */}
                    <span className="text-amber-400 text-xl">♛</span>
                </div>

                {/* Bio / Job Title */}
                <p className="text-[#6B7280] text-base mb-4 line-clamp-2">
                    {user.bio || "لا يوجد نبذة تعريفية"}
                </p>

                {/* Location & Rating */}
                <div className="flex items-center justify-center gap-6 text-[#4B5563]">
                    {/* Location */}
                    {user.city && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">{user.city.name}</span>
                            <MapPin className="w-5 h-5 text-green-500" />
                        </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl font-medium pt-1">{parseFloat(user.review_rate || "0").toFixed(1)}</span>
                        <div className="bg-amber-100 rounded-full p-0.5">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
