"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    threshold?: number;
    rootMargin?: string;
}

export default function LazySection({
    children,
    fallback = null,
    threshold = 0.01,
    rootMargin = "200px",
}: LazySectionProps) {
    const [isInView, setIsInView] = useState(false);
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

    return (
        <div ref={containerRef} className="w-full min-h-[100px]">
            {isInView ? (
                <>{children}</>
            ) : (
                <>{fallback}</>
            )}
        </div>
    );
}
