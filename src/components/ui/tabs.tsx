"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/src/lib/utils";

function Tabs({
  className,
  // Radix renders dir on the root and defaults it to "ltr", which would flip
  // everything inside the tabs out of the app's RTL layout.
  dir = "rtl",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      dir={dir}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-fit items-center justify-center gap-1 rounded-full bg-white px-1.5 py-1.5 border border-[#E2E8F0]",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-c2-slate-500 focus-visible:outline-c2-navy-700 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-c2-navy-700 data-[state=active]:font-bold data-[state=active]:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
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
