import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { TRUST_POINTS } from "../content";
import CheckBadge from "./CheckBadge";

export default function TrustStrip() {
    return (
        <section className="py-6 md:py-16">
            <MaxWidthWrapper>
                <div className="relative isolate overflow-hidden rounded-2xl bg-c2-navy-700 px-6 py-8 md:px-14 md:py-20">
                    <span
                        aria-hidden
                        className="absolute -start-[90px] -top-[204px] -z-10 h-[438.49px] w-[406.95px] rotate-[29.17deg] rounded-full border-2 border-c2-navy-100/50"
                    />
                    <span
                        aria-hidden
                        className="absolute -start-[123px] -top-[321px] -z-10 size-[500px] rounded-full border-2 border-c2-navy-100/50"
                    />
                    <ul className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
                        {TRUST_POINTS.map((point) => (
                            <li key={point} className="flex items-center gap-3 text-lg font-bold text-white md:text-2xl">
                                <CheckBadge className="bg-white text-c2-navy-700" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
