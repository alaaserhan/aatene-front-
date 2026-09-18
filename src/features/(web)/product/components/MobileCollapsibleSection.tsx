"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface MobileCollapsibleSectionProps {
    /** Header label, shown on mobile only. */
    title: string;
    className?: string;
    children: ReactNode;
}

/**
 * Wraps a product page card so that on mobile it becomes an accordion that is
 * collapsed by default: the wrapper itself carries the card chrome and the
 * child card flattens (see the `max-md:` overrides passed to it). From `md` up
 * the header disappears and the child renders exactly as before.
 */
export default function MobileCollapsibleSection({
    title,
    className,
    children,
}: MobileCollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={cn(
                "max-md:mt-6 max-md:rounded-xl max-md:border max-md:border-c2-neutral-200 max-md:bg-white max-md:p-4 max-md:[box-shadow:0px_4px_7px_0px_#00000014]",
                className
            )}
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-2 md:hidden"
            >
                <span className="text-base font-medium text-c2-primary">{title}</span>
                <ChevronDown
                    aria-hidden="true"
                    className={cn(
                        "size-5 shrink-0 text-c2-primary transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <div className={cn(!isOpen && "max-md:hidden")}>{children}</div>
        </div>
    );
}
