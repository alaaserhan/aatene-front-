import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { SHOWCASE } from "../content";
import CheckBadge from "./CheckBadge";
import LandingImage from "./LandingImage";

export default function ShowcaseSection() {
    return (
        <section className="bg-c2-navy-25 py-10 md:py-[90px]">
            <MaxWidthWrapper className="flex flex-col gap-6 md:gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col lg:max-w-122 xl:max-w-none">
                    <h2 className="mb-4 text-[26px] xl:whitespace-nowrap font-bold leading-snug text-c2-navy-800 md:text-[40px] md:leading-[1.5]">
                        {SHOWCASE.title}
                    </h2>
                    <ul className="flex flex-col gap-6">
                        {SHOWCASE.items.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-lg font-bold text-c2-slate-700">
                                <CheckBadge />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-2xl bg-c2-slate-800 p-2.5 shadow-xl md:rounded-[20px] md:p-4 lg:w-160">
                    <LandingImage
                        asset={SHOWCASE.image}
                        sizes="(min-width: 1024px) 608px, 100vw"
                        className="w-full rounded-md"
                    />
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
