"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/src/lib/utils";

/**
 * Two looks for the same primitive:
 * - `pill` (default) — the rounded white bar with a filled navy active pill.
 * - `underline` — a flat full-width row that reads as page-level sub-navigation
 *   above the content it switches, so it doesn't compete with a `pill` row
 *   nested underneath it. Its active trigger pulls itself a pixel down to sit on
 *   the rule, so don't add `overflow-x-auto` to an underline `TabsList`: that
 *   also turns on `overflow-y`, and the browser scrolls that one pixel.
 */
type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>;

const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      pill: "w-fit justify-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-1.5 py-1.5",
      underline: "w-full justify-start gap-6 border-b border-c2-neutral-200",
    },
  },
  defaultVariants: { variant: "pill" },
});

const tabsTriggerVariants = cva(
  "focus-visible:outline-c2-navy-700 inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        pill: "text-c2-slate-500 flex-1 rounded-full border border-transparent px-4 py-2 data-[state=active]:bg-c2-navy-700 data-[state=active]:font-bold data-[state=active]:text-white",
        underline:
          "text-c2-neutral-500 hover:text-c2-primary -mb-px shrink-0 border-b-2 border-transparent px-1 pt-1 pb-3 data-[state=active]:border-c2-primary data-[state=active]:font-bold data-[state=active]:text-c2-primary",
      },
    },
    defaultVariants: { variant: "pill" },
  },
);

/** Set once on `Tabs` so list and triggers stay in the same look. */
const TabsVariantContext = React.createContext<TabsVariant>("pill");

function Tabs({
  className,
  variant = "pill",
  // Radix renders dir on the root and defaults it to "ltr", which would flip
  // everything inside the tabs out of the app's RTL layout.
  dir = "rtl",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { variant?: TabsVariant }) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root
        data-slot="tabs"
        dir={dir}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: TabsVariant }) {
  const contextVariant = React.useContext(TabsVariantContext);

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant: variant ?? contextVariant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & { variant?: TabsVariant }) {
  const contextVariant = React.useContext(TabsVariantContext);

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant: variant ?? contextVariant }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none animate-in fade-in slide-in-from-top-4 duration-300",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
