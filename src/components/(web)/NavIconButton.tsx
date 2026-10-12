"use client";

import * as React from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

/**
 * Shared visual for the circular navbar action icons (compare, favourites,
 * chat, notifications). Kept in one place so every navbar icon — including the
 * notification trigger, which lives in its own component — stays identical.
 */
export const navIconButtonClass =
  "relative rounded-full bg-c2-neutral-300-a10 text-c2-neutral-600 hover:bg-c2-neutral-300-a10/70 hover:text-c2-neutral-800";

/** `alert` (red) for things that need attention, `neutral` for plain tallies. */
type NavIconBadgeTone = "alert" | "neutral";

export function NavIconBadge({ count, tone = "alert" }: { count: number; tone?: NavIconBadgeTone }) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  // The circle grows with the digit count instead of the digits overflowing a
  // fixed box — a wider label in a too-small circle is what read as off-centre.
  const sizeClass =
    label.length > 2
      ? "size-[19px]"
      : label.length > 1
        ? "size-[17px]"
        : "size-[15px]";

  return (
    // Square box (aspect-square + shrink-0) so the badge stays a perfect circle
    // and is never squashed by the button's flex layout.
    <span
      className={cn(
        "pointer-events-none absolute -top-0.5 -right-0.5 grid shrink-0 aspect-square place-items-center rounded-full font-semibold tabular-nums",
        tone === "alert"
          ? "bg-c2-danger text-white"
          : "bg-c2-navy-500 text-white ring-1 ring-white",
        sizeClass
      )}
    >
      {/*
        `font-digits` swaps PingAR's off-centre digits for a Latin UI face, so
        `leading-none` centres them vertically. `dir="ltr"` plus
        `w-full text-center` centres them horizontally without depending on how
        the surrounding RTL layout sizes the text node.
      */}
      <span
        dir="ltr"
        className={cn(
          "block w-full text-center font-digits leading-none",
          label.length > 2 ? "text-[8px]" : "text-[9px]"
        )}
      >
        {label}
      </span>
    </span>
  );
}

type NavIconButtonProps = React.ComponentProps<typeof Button> & {
  count?: number;
  badgeTone?: NavIconBadgeTone;
};

export function NavIconButton({
  className,
  count = 0,
  badgeTone,
  children,
  type = "button",
  ...props
}: NavIconButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="icon"
      className={cn(navIconButtonClass, className)}
      {...props}
    >
      {children}
      <NavIconBadge count={count} tone={badgeTone} />
    </Button>
  );
}
