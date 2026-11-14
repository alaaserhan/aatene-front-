import { cn } from "@/src/lib/utils";

type SectionHeaderProps = {
    title: string;
    description?: string;
    className?: string;
};

export default function SectionHeader({ title, description, className }: SectionHeaderProps) {
    return (
        <div className={cn("mx-auto flex max-w-3xl flex-col items-center gap-4 text-center", className)}>
            <h2 className="text-2xl font-bold leading-snug text-c2-navy-950 md:text-4xl md:leading-[1.45]">
                {title}
            </h2>
            {description ? (
                <p className="max-w-2xl text-sm leading-relaxed text-c2-neutral-600 md:text-lg">{description}</p>
            ) : null}
        </div>
    );
}
