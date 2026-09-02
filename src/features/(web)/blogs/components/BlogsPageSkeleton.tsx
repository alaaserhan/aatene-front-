"use client";

/** Mirrors the hero variant of BlogCard (image + overlay content card). */
function BlogHeroCardSkeleton() {
    return (
        <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-c2-neutral-200 animate-pulse">
            <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white rounded-xl p-5 shadow-lg">
                    <div className="flex flex-col gap-2">
                        {/* Category badge */}
                        <div className="h-6 w-20 rounded-md bg-c2-neutral-200" />

                        {/* Title */}
                        <div className="pb-2 space-y-2">
                            <div className="h-7 w-full rounded bg-c2-neutral-200" />
                            <div className="h-7 w-2/3 rounded bg-c2-neutral-200" />
                        </div>

                        {/* Footer: date + reaction icons */}
                        <div className="flex items-center justify-between mt-2 pt-4">
                            <div className="h-4 w-24 rounded bg-c2-neutral-200" />
                            <div className="flex items-center gap-6">
                                <div className="h-5 w-5 rounded-full bg-c2-neutral-200" />
                                <div className="h-5 w-5 rounded-full bg-c2-neutral-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Mirrors the default variant of BlogCard. */
function BlogCardSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-c2-neutral-200 flex flex-col h-full animate-pulse">
            <div className="h-56 w-full bg-c2-neutral-200" />

            <div className="p-5 flex-1 flex flex-col items-start w-full">
                {/* Category badge */}
                <div className="h-6 w-16 rounded-md bg-c2-neutral-200 mb-3" />

                {/* Title */}
                <div className="w-full space-y-2 mb-3">
                    <div className="h-5 w-full rounded bg-c2-neutral-200" />
                    <div className="h-5 w-3/4 rounded bg-c2-neutral-200" />
                </div>

                {/* Date */}
                <div className="mt-auto h-3 w-20 rounded bg-c2-neutral-200" />
            </div>
        </div>
    );
}

/** Loading placeholder for the blogs grid — same hero + list layout as BlogsPage. */
export function BlogsGridSkeleton({ count = 9 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 lg:col-span-2 row-span-2">
                <BlogHeroCardSkeleton />
            </div>

            {Array.from({ length: Math.max(count - 1, 0) }).map((_, i) => (
                <div key={i} className="min-h-[300px]">
                    <BlogCardSkeleton />
                </div>
            ))}
        </div>
    );
}
