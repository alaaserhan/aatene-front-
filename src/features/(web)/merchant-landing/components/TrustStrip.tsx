import { Fragment } from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { TRUST_POINTS } from "../content";
import CheckBadge from "./CheckBadge";

export default function TrustStrip() {
    return (
        <section className="relative overflow-hidden py-6 md:py-16">
            <MaxWidthWrapper>
                <ul className="flex flex-col items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_8px_30px_-12px] shadow-c2-navy-700/20 md:flex-row md:items-center md:justify-center md:gap-10 md:bg-transparent md:p-0 md:shadow-none">
                    {TRUST_POINTS.map((point, index) => (
                        <Fragment key={point}>
                            {index > 0 ? (
                                <li aria-hidden className="hidden h-6 w-px bg-c2-neutral-200 md:block" />
                            ) : null}
                            <li className="flex items-center gap-3 text-base font-medium text-c2-navy-950 md:text-xl">
                                <CheckBadge />
                                {point}
                            </li>
                        </Fragment>
                    ))}
                </ul>
            </MaxWidthWrapper>
        </section>
    );
}
