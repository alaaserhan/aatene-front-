import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { COMING_SOON } from "../content";
import SectionHeader from "./SectionHeader";
import ToolCarousel from "./ToolCarousel";

export default function ComingSoonSection() {
    return (
        <section className="py-10 md:py-20">
            <MaxWidthWrapper className="flex flex-col gap-6 md:gap-8">
                <SectionHeader title={COMING_SOON.title} description={COMING_SOON.description} />
                <ToolCarousel group="contentTools" />
                <ToolCarousel group="creativeTools" />
            </MaxWidthWrapper>
        </section>
    );
}
