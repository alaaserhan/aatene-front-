"use client";

import { useState } from "react";

import { useRouter, useParams } from "next/navigation";
import { AddToFavoritesModal } from "./AddToFavoritesModal";
import { useRemoveFromFavorites } from "../hooks";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
    id: number | string;
    type: "product" | "service" | "store" | "blog"; // Using specific types
    isFavorite?: boolean;
    className?: string; // For button styling
    iconClassName?: string; // For image size control
    onSuccess?: () => void;
}

export function FavoriteButton({
    id,
    type,
    isFavorite,
    className,
    iconClassName,
    onSuccess,
}: FavoriteButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: removeFromFav, isPending: isRemoving } = useRemoveFromFavorites();
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang || "ar";

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!user) {
            router.push(`/${lang}/login`);
            return;
        }

        if (isFavorite) {
            // If already favorite, remove directly
            removeFromFav(
                {
                    favs_type: type,
                    favs_id: id,
                },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                }
            );
        } else {
            // If not favorite, open modal
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleFavoriteClick}
                disabled={isRemoving}
                className={cn(
                    "cursor-pointer flex items-center justify-center transition-transform hover:scale-110 disabled:opacity-50",
                    className
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart
                    className={cn("size-5", iconClassName, isFavorite ? "fill-red-500 text-red-500" : "text-current")}
                />
            </button>

            {/* Modal */}
            <AddToFavoritesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={type}
                itemId={id}
                isFavorite={isFavorite}
                onSuccess={() => {
                    onSuccess?.();
                    // Modal handles its own closing via onClose prop passed above
                }}
            />
        </>
    );
}
