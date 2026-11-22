import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function CheckBadge({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full bg-c2-primary text-white",
                className,
            )}
        >
            <Check className="size-3.5" strokeWidth={3} />
        </span>
    );
}
