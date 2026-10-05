import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

/** Mirrors ReviewStatisticsDisplay: average card on one side, five rating bars on the other */
export function ReviewStatisticsSkeleton() {
    return (
        <div className="mb-8 flex w-full flex-col items-start gap-8 md:flex-row" aria-hidden="true">
            <div className="flex h-[160px] w-full shrink-0 flex-col items-center justify-center gap-3 rounded-2xl bg-c2-neutral-50 p-6 md:w-[220px]">
                <Skeleton className="h-12 w-20 rounded-lg" />
                <Skeleton className="h-3 w-16" />
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-5 rounded-full" />
                    ))}
                </div>
            </div>

            <div className="flex h-[160px] w-full flex-1 flex-col justify-center gap-4">
                {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-4">
                        <Skeleton className="h-3.5 w-14" />
                        <Skeleton className="h-1.5 flex-1 rounded-full" />
                        <Skeleton className="h-3.5 w-8" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Mirrors a single ReviewItem card; `isReply` gives the indented, tinted reply shape */
export function ReviewItemSkeleton({ isReply = false, lines = 2 }: { isReply?: boolean; lines?: number }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "flex flex-col gap-4 rounded-xl border",
                isReply
                    ? "ms-8 border-c2-neutral-200 border-s-2 border-s-c2-navy-300 bg-c2-neutral-50 p-4 md:ms-16"
                    : "border-gray-200 bg-white p-5",
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Skeleton className={cn("shrink-0 rounded-full", isReply ? "h-8 w-8" : "h-10 w-10")} />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-2.5 w-16" />
                    </div>
                </div>
                {!isReply && <Skeleton className="h-4 w-24" />}
            </div>

            <div className="flex flex-col gap-2">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
                ))}
            </div>

            {!isReply && (
                <div className="mt-1 flex items-center justify-between gap-3">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                </div>
            )}
        </div>
    );
}

export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4" role="status" aria-busy="true" aria-label="جاري تحميل المراجعات">
            {Array.from({ length: count }).map((_, i) => (
                <ReviewItemSkeleton key={i} lines={i % 2 === 0 ? 2 : 3} />
            ))}
        </div>
    );
}
