"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { LandingAsset } from "../content";

type LandingImageProps = {
    asset: LandingAsset;
    className?: string;
    sizes?: string;
    priority?: boolean;
};

/** Renders a landing asset, falling back to a labelled box until the file is added to `public/`. */
export default function LandingImage({ asset, className, sizes, priority }: LandingImageProps) {
    const [missing, setMissing] = useState(false);

    if (missing) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-c2-navy-100 bg-c2-navy-50 p-2 text-center text-c2-navy-300",
                    className,
                )}
                style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
                aria-hidden={!asset.alt}
            >
                <ImageIcon className="size-5 shrink-0" />
                <span className="text-[10px] leading-tight break-all" dir="ltr">
                    {asset.src.split("/").pop()}
                </span>
            </div>
        );
    }

    return (
        <Image
            src={asset.src}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            sizes={sizes}
            priority={priority}
            className={cn("h-auto", className)}
            onError={() => setMissing(true)}
        />
    );
}
