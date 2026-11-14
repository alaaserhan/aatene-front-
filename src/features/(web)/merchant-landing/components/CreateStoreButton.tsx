import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import CreateStoreLink from "./CreateStoreLink";

type CreateStoreButtonProps = {
    label: string;
    variant?: "primary" | "inverse";
    className?: string;
};

export default function CreateStoreButton({ label, variant = "primary", className }: CreateStoreButtonProps) {
    return (
        <Button
            asChild
            className={cn(
                "h-13 gap-3 rounded-xl px-10 text-base font-medium shadow-[0_12px_24px_-6px] has-[>svg]:px-10 md:h-14 md:px-12 md:text-lg md:has-[>svg]:px-12",
                variant === "primary"
                    ? "bg-c2-primary text-white shadow-c2-navy-700/35"
                    : "bg-white text-c2-primary shadow-black/25 hover:bg-c2-navy-50",
                className,
            )}
        >
            <CreateStoreLink>
                {label}
                <ArrowLeft className="size-4" />
            </CreateStoreLink>
        </Button>
    );
}
