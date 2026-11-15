import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { COMING_SOON } from "../content";
import ToolCarousel from "./ToolCarousel";

export default function ComingSoonSection() {
    const { title } = COMING_SOON;

    return (
        <section className="py-10 md:py-20">
            <MaxWidthWrapper className="flex flex-col gap-6 md:gap-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
                    <h2 className="text-[26px] font-bold leading-snug text-c2-navy-975 md:text-[40px] md:leading-[1.4]">
                        {title.before}
                        <span className="text-c2-primary">{title.brand}</span>
                    </h2>
                    <p className="max-w-2xl text-base font-medium leading-relaxed text-c2-slate-800-a70 md:text-lg">
                        {COMING_SOON.description}
                    </p>
                </div>
                <ToolCarousel group="contentTools" />
                <ToolCarousel group="creativeTools" />
            </MaxWidthWrapper>
        </section>
    );
}
