import { cn } from "@/src/lib/utils";
import { ReactNode } from "react";

const MaxWidthWrapper = ({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) => {
    return (
        <div
            className={cn(
                " container px-4 md:px-8",
                className
            )}
        >
            {children}
        </div>
    );
};

export default MaxWidthWrapper;
