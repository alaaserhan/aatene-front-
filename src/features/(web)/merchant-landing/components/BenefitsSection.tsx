import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { cn } from "@/src/lib/utils";
import { BENEFITS } from "../content";
import LandingImage from "./LandingImage";

export default function BenefitsSection() {
    const { title } = BENEFITS;

    return (
        <section className="py-10 md:py-20">
            <MaxWidthWrapper className="flex flex-col gap-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
                    <h2 className="text-[26px] font-bold leading-snug text-c2-navy-975 md:text-[40px] md:leading-[1.4]">
                        {title.before}
                        <span className="text-c2-primary">{title.brand}</span>
                        {title.after}
                    </h2>
                    <p className="max-w-2xl text-[16px] leading-relaxed text-c2-slate-800-a70 md:text-lg">
                        {BENEFITS.description}
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {BENEFITS.items.map((item, index) => (
                        <article
                            key={item.title}
                            className={cn(
                                "flex flex-col rounded-3xl border p-6 transition-transform hover:-translate-y-1 lg:min-h-78 lg:p-7",
                                index % 2 === 0
                                    ? "border-c2-blue-50 bg-c2-blue-50"
                                    : "border-c2-neutral-200 bg-white",
                            )}
                        >
                            <LandingImage asset={item.image} className="mb-4 size-15 object-contain" />
                            <h3 className="mb-3 text-lg font-bold leading-snug text-c2-navy-975 md:text-xl">
                                {item.title}
                            </h3>
                            <p className="text-base leading-relaxed font-normal text-c2-navy-560">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
