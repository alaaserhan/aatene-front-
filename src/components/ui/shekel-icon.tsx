import type { SVGProps } from "react";
import { cn } from "@/src/lib/utils";

/**
 * The ₪ sign drawn as a vector, for places where it has to centre against
 * digits (pills, badges). A text glyph can't do that: every font parks ₪ low
 * in its em box, so only the box centres, never the ink. The viewBox is
 * cropped to the ink here, so flex centring is exact. Size it in `em` to
 * follow the surrounding text, e.g. `size-[0.75em]`.
 */
export function ShekelIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            role="img"
            aria-label="شيكل"
            className={cn("shrink-0", className)}
            {...props}
        >
            <path d="M1 16V1h6.5a3 3 0 0 1 3 3v7" />
            <path d="M15 0v12a3 3 0 0 1-3 3H5.5V5" />
        </svg>
    );
}
