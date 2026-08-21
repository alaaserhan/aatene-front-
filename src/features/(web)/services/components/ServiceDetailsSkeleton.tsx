import { Container, Section } from "@/src/components/shared/Container";
import { cn } from "@/src/lib/utils";

const shimmer = "animate-pulse rounded bg-c2-neutral-200";

/**
 * Placeholder for ServiceDetailsPage. Mirrors the three bands of the real page
 * (tinted hero, tinted tabs triggers, white tab panel) so nothing shifts once
 * the service data lands.
 */
export default function ServiceDetailsSkeleton() {
  return (
    <div dir="rtl" className="bg-white" aria-hidden="true">
      <Section className="bg-c2-neutral-50 pt-8 pb-6 lg:pb-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <div className={cn(shimmer, "h-3.5 w-24")} />
          <div className={cn(shimmer, "h-3.5 w-3")} />
          <div className={cn(shimmer, "h-3.5 w-40")} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-3 lg:w-[55%] lg:items-start">
            <div
              className={cn(
                "flex shrink-0 gap-2.5",
                "h-[100px] w-full flex-row overflow-hidden",
                "lg:h-auto lg:w-[100px] lg:flex-col",
              )}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(shimmer, "size-[100px] shrink-0 rounded-md")}
                />
              ))}
            </div>

            <div className={cn(shimmer, "flex-1 aspect-square w-full rounded-lg")} />
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="white-card mb-6">
              {/* Price */}
              <div className={cn(shimmer, "mb-4 h-6 w-32")} />

              {/* Rating */}
              <div className={cn(shimmer, "mb-4 h-4 w-40")} />

              {/* Title + actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className={cn(shimmer, "h-5 w-full")} />
                  <div className={cn(shimmer, "h-5 w-2/3")} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className={cn(shimmer, "size-7 rounded-full")} />
                  <div className={cn(shimmer, "size-7 rounded-full")} />
                </div>
              </div>
            </div>

            {/* Extras */}
            <div className="white-card mb-6 flex flex-col gap-3">
              <div className={cn(shimmer, "h-4 w-32")} />
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-c2-neutral-200 p-3"
                >
                  <div className={cn(shimmer, "size-5 shrink-0 rounded-sm")} />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className={cn(shimmer, "h-3.5 w-2/5")} />
                    <div className={cn(shimmer, "h-3 w-1/3")} />
                  </div>
                </div>
              ))}
            </div>

            {/* Store card */}
            <div className="white-card mb-8 flex items-center gap-3">
              <div className={cn(shimmer, "size-12 shrink-0 rounded-full")} />
              <div className="flex flex-1 flex-col gap-2">
                <div className={cn(shimmer, "h-4 w-1/3")} />
                <div className={cn(shimmer, "h-3 w-1/4")} />
              </div>
            </div>

            {/* Contact actions */}
            <div className="flex flex-col gap-3">
              <div className={cn(shimmer, "h-11 w-full rounded-full")} />
              <div className={cn(shimmer, "h-11 w-full rounded-full")} />
              <div className={cn(shimmer, "h-3.5 w-36")} />
            </div>
          </div>
        </div>
      </Section>

      {/* Tabs triggers */}
      <div className="bg-c2-neutral-50">
        <Container className="pb-6 lg:pt-9">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(shimmer, "h-10 min-w-30 shrink-0 rounded-full")}
              />
            ))}
          </div>
        </Container>
      </div>

      {/* Active tab panel */}
      <div className="bg-white shadow-md">
        <Container className="pt-8 pb-8 lg:pb-20">
          <div className="min-h-75 space-y-3">
            <div className={cn(shimmer, "mb-4 h-5 w-40")} />
            {["w-full", "w-11/12", "w-full", "w-4/5", "w-3/5"].map((width) => (
              <div key={width} className={cn(shimmer, "h-4", width)} />
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}
