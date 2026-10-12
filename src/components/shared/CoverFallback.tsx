import { cn } from "@/src/lib/utils";

/**
 * Banner shown when a store or user has no cover. A brand navy gradient rather
 * than a blank box: an empty cover reads as a failed image, and white/light logos
 * overlapping its edge would disappear into it.
 */
export default function CoverFallback({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "absolute inset-0 bg-linear-to-l from-c2-navy-900 via-c2-navy-700 to-c2-navy-500",
                className
            )}
        >
            {/* Soft light spots so the strip has depth instead of a flat ramp */}
            <div className="absolute -top-1/2 start-[10%] h-[160%] aspect-square rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-2/3 end-[15%] h-[140%] aspect-square rounded-full bg-c2-navy-100/10 blur-3xl" />
        </div>
    );
}
