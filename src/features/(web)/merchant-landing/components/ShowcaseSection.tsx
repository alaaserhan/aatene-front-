import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { SHOWCASE } from "../content";
import CheckBadge from "./CheckBadge";
import LandingImage from "./LandingImage";

export default function ShowcaseSection() {
    return (
        <section className="bg-c2-navy-50 py-10 md:py-24">
            <MaxWidthWrapper className="flex flex-col gap-6 md:gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-6 md:gap-8 lg:max-w-122">
                    <h2 className="text-2xl font-bold leading-snug text-c2-navy-950 md:text-[40px] md:leading-[1.5]">
                        {SHOWCASE.title}
                    </h2>
                    <ul className="flex flex-col gap-4 md:gap-6">
                        {SHOWCASE.items.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-base text-c2-neutral-700 md:text-lg">
                                <CheckBadge />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-[28px] bg-c2-navy-950 p-3 shadow-[0_30px_60px_-20px] shadow-c2-navy-900/50 md:p-3.5 lg:w-160">
                    <LandingImage
                        asset={SHOWCASE.image}
                        sizes="(min-width: 1024px) 640px, 100vw"
                        className="w-full rounded-2xl"
                    />
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
