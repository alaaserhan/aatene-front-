// src/components/ui/accordion.tsx
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown, Plus, Minus } from "lucide-react"

import { cn } from "@/src/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

// تعريف الـ Interface لإضافة الـ Prop الجديد
interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  iconStyle?: "chevron" | "plus-minus"; // خاصية للتحكم في شكل الأيقونة
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, iconStyle = "chevron", ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        // أضفنا كلاس group للتحكم في الأبناء بناءً على حالة الأب
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left group",
        // تدوير السهم فقط في حالة chevron
        iconStyle === "chevron" && "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      
      {/* الخيار الافتراضي: سهم */}
      {iconStyle === "chevron" && (
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      )}

      {/* الخيار الجديد: + و - داخل دائرة */}
      {iconStyle === "plus-minus" && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-4 text-blue-4 cursor-pointer">
          <Plus className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:hidden" />
          <Minus className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=closed]:hidden" />
        </div>
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }