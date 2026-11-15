import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { FINAL_CTA } from "../content";
import CreateStoreButton from "./CreateStoreButton";

export default function FinalCtaSection() {
    return (
        <section className="pb-12 md:pb-[90px]">
            <MaxWidthWrapper>
                <div className="relative isolate overflow-hidden rounded-3xl border-2 border-dashed border-c2-navy-700 bg-[linear-gradient(90deg,var(--c2-navy-100)_2.42%,var(--c2-navy-90)_51.21%,var(--c2-navy-100)_100%)] px-5 py-12 text-center md:px-16 md:py-20">
                    <span
                        aria-hidden
                        className="absolute -bottom-44 -start-28 -z-10 size-72 rounded-full border border-c2-navy-300 md:-bottom-72 md:-start-57 md:size-114"
                    />
                    <span
                        aria-hidden
                        className="absolute -bottom-52 start-0 -z-10 size-64 rounded-full border border-c2-navy-300 md:-bottom-78 md:size-102"
                    />
                    <div className="mx-auto flex max-w-4xl flex-col items-center">
                        <h2 className="mb-6 text-[26px] font-bold leading-normal text-c2-navy-700 md:text-[52px] md:leading-[1.35]">
                            {FINAL_CTA.title}
                        </h2>
                        <p className="mb-6 text-[16px] font-medium leading-relaxed text-c2-slate-700 md:text-lg">
                            {FINAL_CTA.description}
                        </p>
                        <CreateStoreButton label={FINAL_CTA.cta} className="rounded-full" />
                    </div>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
