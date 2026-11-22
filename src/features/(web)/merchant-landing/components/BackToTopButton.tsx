"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import { LANDING_TOP_ID } from "../motion";

const LABEL = "العودة إلى الأعلى";

/** Shows once the hero is scrolled past; the ring tracks page progress (CSS scroll timeline). */
export default function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            setVisible(window.scrollY > window.innerHeight);
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(frame);
        };
    }, []);

    const scrollToTop = () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        // The button hides at the top, so keyboard focus would otherwise be left on nothing.
        document.getElementById(LANDING_TOP_ID)?.focus({ preventScroll: true });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label={LABEL}
            title={LABEL}
            inert={!visible}
            className={cn(
                "group relative flex size-12 items-center justify-center rounded-full bg-white text-c2-navy-700 shadow-lg transition-[opacity,translate,scale] duration-300 ease-out hover:bg-c2-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c2-primary",
                visible ? "pointer-events-auto" : "translate-y-4 scale-90 opacity-0",
            )}
        >
            <svg viewBox="0 0 48 48" aria-hidden className="absolute inset-0 size-full -rotate-90">
                <circle cx="24" cy="24" r="22.75" fill="none" strokeWidth="2.5" className="stroke-c2-neutral-200" />
                <circle
                    cx="24"
                    cy="24"
                    r="22.75"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    pathLength={100}
                    strokeDasharray="100"
                    strokeDashoffset="100"
                    className="ml-scroll-progress stroke-c2-primary"
                />
            </svg>
            <ArrowUp className="size-5 transition-transform group-hover:-translate-y-0.5" strokeWidth={2.25} />
        </button>
    );
}
