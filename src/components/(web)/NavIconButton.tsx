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

export function NavIconBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-c2-danger px-1 text-[10px] leading-none font-medium text-white">
      {count > 99 ? "+99" : count}
    </span>
  );
}

type NavIconButtonProps = React.ComponentProps<typeof Button> & {
  count?: number;
};

export function NavIconButton({
  className,
  count = 0,
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
      <NavIconBadge count={count} />
    </Button>
  );
}
