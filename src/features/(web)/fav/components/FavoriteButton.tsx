"use client";

import { useState } from "react";
import Image from "next/image";
import { AddToFavoritesModal } from "./AddToFavoritesModal";
import { useRemoveFromFavorites } from "../hooks";
import { cn } from "@/src/lib/utils";

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

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

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
                {isFavorite ? (
                    <Image
                        src="/icons/HeartRed.png"
                        alt="Favorite"
                        width={20}
                        height={20}
                        className={iconClassName}
                    />
                ) : (
                    <Image
                        src="/icons/heart.svg"
                        alt="Favorite"
                        width={20}
                        height={20}
                        className={iconClassName}
                    />
                )}
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
