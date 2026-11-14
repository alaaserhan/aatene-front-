import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { FINAL_CTA } from "../content";
import CreateStoreButton from "./CreateStoreButton";

export default function FinalCtaSection() {
    return (
        <section className="py-10 md:py-20">
            <MaxWidthWrapper>
                <div className="relative isolate overflow-hidden rounded-[32px] bg-c2-primary px-5 py-12 text-center md:px-16 md:py-20">
                    <span aria-hidden className="absolute -end-24 -top-24 -z-10 size-96 rounded-full bg-white/10 blur-3xl" />
                    <span aria-hidden className="absolute -bottom-40 -start-24 -z-10 size-96 rounded-full bg-c2-navy-500/40 blur-3xl" />
                    <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 md:gap-6">
                        <h2 className="text-2xl font-bold leading-normal text-white md:text-5xl md:leading-[1.35]">
                            {FINAL_CTA.title}
                        </h2>
                        <p className="text-sm leading-relaxed text-c2-navy-100 md:text-lg">{FINAL_CTA.description}</p>
                        <CreateStoreButton label={FINAL_CTA.cta} variant="inverse" className="mt-2" />
                    </div>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
