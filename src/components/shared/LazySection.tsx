"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";

interface LazySectionProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    threshold?: number;
    rootMargin?: string;
    className?: string;
}

export default function LazySection({
    children,
    fallback = null,
    threshold = 0.01,
    rootMargin = "400px",
    className,
}: LazySectionProps) {
    const [isInView, setIsInView] = useState(false);
    const [hasRendered, setHasRendered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        const currentRef = containerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [isInView, threshold, rootMargin]);

    useEffect(() => {
        if (isInView) {
            const frame = requestAnimationFrame(() => setHasRendered(true));
            return () => cancelAnimationFrame(frame);
        }
    }, [isInView]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full",
                !isInView && !fallback && "min-h-[30px]",
                className
            )}
        >
            {isInView ? (
                <div
                    className={cn(
                        "transition-opacity duration-500 ease-out",
                        hasRendered ? "opacity-100" : "opacity-0"
                    )}
                >
                    {children}
                </div>
            ) : (
                <>{fallback}</>
            )}
        </div>
    );
}
