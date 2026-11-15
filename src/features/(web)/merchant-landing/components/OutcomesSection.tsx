import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { OUTCOMES } from "../content";
import LandingImage from "./LandingImage";

export default function OutcomesSection() {
    const { title } = OUTCOMES;

    return (
        <section className="pb-10 md:pb-20">
            <MaxWidthWrapper className="flex flex-col gap-6">
                <div className="mx-auto flex flex-col items-center gap-4 text-center">
                    <h2 className="text-[26px] font-bold leading-snug text-c2-navy-975 md:text-[40px] md:leading-[1.4]">
                        {title.before}
                        <span className="text-c2-primary">{title.brand}</span>
                        {title.after}
                    </h2>
                    <p className="text-[16px] leading-relaxed font-medium text-c2-slate-800-a70 md:text-lg">
                        {OUTCOMES.description}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:gap-6">
                    {OUTCOMES.items.map((item) => (
                        <article
                            key={item.title}
                            className="flex min-w-0 flex-col rounded-2xl border border-s-4 border-c2-navy-700 bg-c2-blue-50 p-3 md:rounded-3xl md:border-s-6 md:p-6"
                        >
                            <div className="mb-3 flex h-14 items-center justify-center md:mb-4 md:h-20">
                                <LandingImage asset={item.image} className="max-h-full w-auto object-contain" />
                            </div>
                            <div className="flex flex-col gap-1.5 text-center md:gap-2">
                                <h3 className="text-base font-bold leading-snug text-c2-navy-850 md:text-2xl">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed font-medium text-c2-navy-560 md:text-base">
                                    {item.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
