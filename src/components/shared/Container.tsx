import { cn } from "@/src/lib/utils";
import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

const CONTAINER = "w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16";

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * Shared page container. Constrains content width and applies the horizontal
 * page padding. Use it per section instead of once around the whole page, so
 * each section stays free to paint its own full-bleed background.
 */
export function Container<T extends ElementType = "div">({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Comp = (as ?? "div") as ElementType;

  return (
    <Comp className={cn(CONTAINER, className)} {...props}>
      {children}
    </Comp>
  );
}

type SectionProps = {
  /** Full-bleed wrapper — put background / vertical padding here. */
  className?: string;
  /** Applied to the inner constrained container. */
  containerClassName?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "className" | "children">;

/**
 * Full-bleed section with a constrained container inside it.
 * The background set on `className` spans the full viewport width while the
 * content stays aligned with the rest of the page.
 */
export function Section({
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("w-full", className)} {...props}>
      <div className={cn(CONTAINER, containerClassName)}>{children}</div>
    </section>
  );
}

export default Container;
