"use client";

import { Globe } from "lucide-react";

export type PlatformIconSize = "sm" | "md" | "lg";

const SIZE: Record<PlatformIconSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
};

/**
 * أيقونة مناسبة لاسم المنصة القادم من الـ API (api1 / Laravel).
 * يُفضَّل إضافة مسارات جديدة هنا عند ظهور منصات إضافية.
 */
export function PlatformBrandIcon({
    platform,
    size = "md",
}: {
    platform: string;
    size?: PlatformIconSize;
}) {
    const k = (platform ?? "").trim().toLowerCase();
    const cls = `${SIZE[size]} object-contain shrink-0`;

    let src: string | null = null;

    if (k.includes("whatsapp")) {
        src = "/icons/dashboard/whatsapp2.svg";
    } else if (k.includes("instagram") || k === "insta") {
        src = "/icons/dashboard/instagram2.svg";
    } else if (k.includes("messenger") || k === "meta_messenger") {
        src = "/icons/dashboard/messenger.svg";
    } else if (k.includes("facebook") || k === "fb") {
        src = "/icons/dashboard/facebook3.svg";
    } else if (k === "website" || k === "web") {
        src = "/logo-sm.svg";
    } else if (k.includes("mobile") || k === "ios" || k === "android" || k === "mobile_app") {
        src = "/icons/dashboard/mobile.svg";
    } else if (k.includes("youtube")) {
        src = "/icons/dashboard/youtube.svg";
    } else if (k.includes("tiktok")) {
        src = "/icons/dashboard/tiktok.svg";
    } else if (k.includes("twitter") || k === "x") {
        src = "/icons/dashboard/twitter.svg";
    } else if (k.includes("snap")) {
        src = "/icons/dashboard/snap.svg";
    } else if (k.includes("telegram")) {
        src = "/icons/dashboard/message2.svg";
    }

    if (!src) {
        return <Globe className={`${cls} text-slate-500`} aria-hidden />;
    }

    return <img src={src} className={cls} alt="" aria-hidden />;
}
