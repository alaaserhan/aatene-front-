import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { OUTCOMES } from "../content";
import LandingImage from "./LandingImage";
import SectionHeader from "./SectionHeader";

export default function OutcomesSection() {
    return (
        <section className="py-10 md:py-20">
            <MaxWidthWrapper className="flex flex-col gap-6 md:gap-8">
                <SectionHeader title={OUTCOMES.title} description={OUTCOMES.description} />
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                    {OUTCOMES.items.map((item) => (
                        <article
                            key={item.title}
                            className="flex flex-col items-center gap-3 rounded-3xl border border-c2-neutral-200 bg-white p-4 text-center md:gap-4 md:p-6 lg:min-h-74"
                        >
                            <div className="flex h-16 items-center md:h-22">
                                <LandingImage asset={item.image} className="max-h-full w-auto object-contain" />
                            </div>
                            <h3 className="text-base font-bold leading-snug text-c2-navy-950 md:text-xl">{item.title}</h3>
                            <p className="text-xs leading-relaxed text-c2-neutral-600 md:text-base">{item.description}</p>
                        </article>
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
