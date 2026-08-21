import { formatPrice } from "@/src/lib/format-price";
import { cn } from "@/src/lib/utils";

const sizeClassName = {
  lg: "text-3xl font-bold",
  md: "text-base font-medium",
  sm: "text-sm font-medium",
} as const;

interface PriceProps {
  value: string | number | null | undefined;
  size?: keyof typeof sizeClassName;
  className?: string;
}

/** Displays a formatted price with the shekel sign. */
export function Price({ value, size = "lg", className }: PriceProps) {
  return (
    <p className={cn(sizeClassName[size], className)}>
      {formatPrice(value)} ₪
    </p>
  );
}
