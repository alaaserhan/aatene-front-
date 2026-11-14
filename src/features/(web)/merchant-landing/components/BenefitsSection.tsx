import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { cn } from "@/src/lib/utils";
import { BENEFITS, type BenefitTone } from "../content";
import LandingImage from "./LandingImage";
import SectionHeader from "./SectionHeader";

const TONE_CLASSES: Record<BenefitTone, { card: string; title: string; text: string }> = {
    navy: { card: "bg-c2-primary border-c2-primary", title: "text-white", text: "text-c2-navy-100" },
    sky: { card: "bg-c2-navy-50 border-c2-navy-100", title: "text-c2-navy-950", text: "text-c2-neutral-600" },
    white: { card: "bg-white border-c2-neutral-200", title: "text-c2-navy-950", text: "text-c2-neutral-600" },
    muted: { card: "bg-c2-slate-50 border-c2-navy-100", title: "text-c2-navy-950", text: "text-c2-neutral-600" },
};

export default function BenefitsSection() {
    return (
        <section className="py-10 md:py-16">
            <MaxWidthWrapper className="flex flex-col gap-6 md:gap-8">
                <SectionHeader title={BENEFITS.title} description={BENEFITS.description} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {BENEFITS.items.map((item) => {
                        const tone = TONE_CLASSES[item.tone];
                        return (
                            <article
                                key={item.title}
                                className={cn(
                                    "flex flex-col gap-4 rounded-3xl border p-6 transition-transform hover:-translate-y-1 lg:min-h-78 lg:p-7",
                                    tone.card,
                                )}
                            >
                                <LandingImage asset={item.image} className="size-15 object-contain" />
                                <h3 className={cn("text-lg font-bold leading-snug md:text-xl", tone.title)}>
                                    {item.title}
                                </h3>
                                <p className={cn("text-sm leading-relaxed md:text-base", tone.text)}>
                                    {item.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
