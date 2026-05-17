"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";

interface DualRangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    className?: string;
}

export function DualRangeSlider({
    min,
    max,
    step = 1,
    value,
    onValueChange,
    className,
}: DualRangeSliderProps) {
    const [localValue, setLocalValue] = useState(value);
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef<"min" | "max" | null>(null);
    const valueRef = useRef(localValue);

    // Sync props to state and ref
    useEffect(() => {
        setLocalValue(value);
        valueRef.current = value;
    }, [value[0], value[1]]);

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

    const updateValue = (clientX: number) => {
        if (!sliderRef.current || !isDragging.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        // Invert calculation for RTL: 0 is on the right
        const percent = Math.min(Math.max((rect.right - clientX) / rect.width, 0), 1);
        const rawValue = percent * (max - min) + min;
        const newValue = Math.round(rawValue / step) * step;

        setLocalValue((prev) => {
            let next: [number, number];
            if (isDragging.current === "min") {
                const clamped = Math.min(newValue, prev[1] - step);
                const safeClamped = Math.max(min, clamped);
                next = [safeClamped, prev[1]];
            } else {
                const clamped = Math.max(newValue, prev[0] + step);
                const safeClamped = Math.min(max, clamped);
                next = [prev[0], safeClamped];
            }
            valueRef.current = next;
            return next;
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        updateValue(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
        updateValue(e.touches[0].clientX);
    };

    const handleMouseUp = () => {
        if (isDragging.current) {
            onValueChange(valueRef.current);
        }
        isDragging.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleMouseUp);
    };

    const handleMouseDown = (thumb: "min" | "max") => (e: React.MouseEvent | React.TouchEvent) => {
        isDragging.current = thumb;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleMouseUp);
    };

    return (
        <div className={cn("relative w-full h-12 flex items-center select-none touch-none", className)}>
            <div
                ref={sliderRef}
                className="relative w-full h-1.5 bg-gray-100 rounded-full"
            >
                {/* Active Track */}
                <div
                    className="absolute h-full bg-blue-4 rounded-full"
                    style={{
                        right: `${getPercentage(localValue[0])}%`,
                        width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`,
                    }}
                />

                {/* Min Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-blue-4 border-2 border-white rounded-full shadow cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 box-content"
                    style={{ right: `${getPercentage(localValue[0])}%` }}
                    onMouseDown={handleMouseDown("min")}
                    onTouchStart={handleMouseDown("min")}
                >
                    {/* Label below thumb */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-blue-4">
                        ₪{formatPrice(localValue[0])}
                    </div>
                </div>

                {/* Max Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-blue-4 border-2 border-white rounded-full shadow cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 box-content"
                    style={{ right: `${getPercentage(localValue[1])}%` }}
                    onMouseDown={handleMouseDown("max")}
                    onTouchStart={handleMouseDown("max")}
                >
                    {/* Label below thumb */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-blue-4">
                        ₪{formatPrice(localValue[1])}
                    </div>
                </div>
            </div>
        </div>
    );
}
