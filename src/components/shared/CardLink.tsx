import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/src/lib/utils";

/**
 * Makes a whole card clickable without wrapping the card in an `<a>`.
 *
 * Render it around the card's title. Its `::after` stretches over the nearest
 * positioned ancestor — so the card must be `relative` with nothing positioned
 * in between — and takes clicks anywhere on the card. The card's own controls
 * stay real buttons beside the link, lifted above the overlay with
 * `CARD_ACTION`. Nesting them inside the link instead is invalid HTML and makes
 * every action fight the navigation with `preventDefault`.
 *
 * Give the card `isolate` so these z-indices stay scoped to it, and pass the
 * card's radius as `after:rounded-*` so the focus ring follows its corners.
 */
export function CardLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "outline-none after:absolute after:inset-0 after:z-1",
        "focus-visible:after:ring-2 focus-visible:after:ring-c2-navy-600 focus-visible:after:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

/** Lifts a card control (button, checkbox, menu) above the `CardLink` overlay. */
export const CARD_ACTION = "relative z-2";
