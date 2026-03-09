import React from "react";
import { cn } from "@/src/lib/utils";
import Image from "next/image";

interface DragHintProps {
    text: string;
    iconSrc?: string;
    className?: string;
}

export function DragHint({
    text,
    iconSrc = "/icons/dashboard/orderData.svg",
    className
}: DragHintProps) {
    return (
        <div className={cn("flex items-center gap-2 text-sm text-blue-4 bg-blue-6 rounded-xs p-2.5", className)}>
            <Image src={iconSrc} alt="info" width={16} height={16} className="w-4 h-4" />
            <span>{text}</span>
        </div>
    );
}
