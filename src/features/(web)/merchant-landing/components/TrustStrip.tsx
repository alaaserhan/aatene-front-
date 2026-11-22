import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { TRUST_POINTS } from "../content";
import { staggerStyle } from "../motion";
import CheckBadge from "./CheckBadge";

export default function TrustStrip() {
    return (
        <section className="pt-10 md:pt-20">
            <MaxWidthWrapper>
                {/* `overflow-clip`, not `overflow-hidden`: a hidden-overflow box is a scroll
                    container, and the points' scroll reveals would track it instead of the page. */}
                <div className="ml-reveal relative isolate overflow-clip rounded-2xl bg-c2-navy-700 px-6 py-8 md:px-14 md:py-20">
                    <span
                        aria-hidden
                        className="ml-drift absolute -start-[90px] -top-[204px] -z-10 h-[438.49px] w-[406.95px] rotate-[29.17deg] rounded-full border-2 border-c2-navy-100/50"
                    />
                    <span
                        aria-hidden
                        className="ml-drift-slow absolute -start-[123px] -top-[321px] -z-10 size-[500px] rounded-full border-2 border-c2-navy-100/50"
                    />
                    <ul className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
                        {TRUST_POINTS.map((point, index) => (
                            <li
                                key={point}
                                className="ml-reveal-side flex items-center gap-3 text-[18px] font-bold text-white md:text-2xl"
                                style={staggerStyle(index)}
                            >
                                <CheckBadge className="ml-pop bg-white text-c2-navy-700" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
