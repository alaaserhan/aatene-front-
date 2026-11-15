import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { OUTCOMES } from "../content";
import LandingImage from "./LandingImage";

export default function OutcomesSection() {
    const { title } = OUTCOMES;

    return (
        <section className="py-10 md:py-20">
            <MaxWidthWrapper className="flex flex-col gap-6">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
                    <h2 className="text-2xl font-bold leading-snug text-c2-navy-975 md:text-[40px] md:leading-[1.4]">
                        {title.before}
                        <span className="text-c2-primary">{title.brand}</span>
                        {title.after}
                    </h2>
                    <p className="max-w-2xl text-base leading-relaxed font-medium text-c2-slate-800-a70 md:text-lg">
                        {OUTCOMES.description}
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {OUTCOMES.items.map((item) => (
                        <article
                            key={item.title}
                            className="flex flex-col rounded-3xl border border-s-6 border-c2-navy-700 bg-c2-blue-50 p-6"
                        >
                            <div className="mb-4 flex h-20 items-center">
                                <LandingImage asset={item.image} className="max-h-full w-auto object-contain" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-bold leading-snug text-c2-navy-850 md:text-2xl">
                                    {item.title}
                                </h3>
                                <p className="text-base leading-relaxed font-medium text-c2-navy-560">
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
