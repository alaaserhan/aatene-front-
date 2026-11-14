import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Logo } from "@/src/components/(web)/Navbar";
import { HEADER_CTA, HERO } from "../content";
import CreateStoreButton from "./CreateStoreButton";
import CreateStoreLink from "./CreateStoreLink";
import LandingImage from "./LandingImage";

function LandingHeader() {
    return (
        <header className="relative z-20 bg-c2-navy-100">
            <MaxWidthWrapper className="flex h-18 items-center justify-between md:h-20">
                <Logo />
                <CreateStoreLink className="rounded-full bg-c2-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 md:px-8">
                    {HEADER_CTA}
                </CreateStoreLink>
            </MaxWidthWrapper>
        </header>
    );
}

export default function LandingHero() {
    return (
        <section className="relative overflow-hidden bg-white">
            <LandingHeader />
            <MaxWidthWrapper className="relative z-10 grid items-center gap-8 pb-12 pt-8 lg:grid-cols-2 lg:gap-6 lg:pb-20 lg:pt-16">
                <div
                    aria-hidden
                    className="absolute inset-0 hidden bg-c2-navy-75 [clip-path:polygon(62%_0,100%_0,100%_100%,59%_100%,82%_50%)] lg:block"
                />
                <div className="relative flex flex-col items-center gap-6 text-center">
                    <h1 className="text-[28px] font-bold leading-[1.55] text-c2-navy-700 md:text-5xl md:leading-[1.4] lg:text-[56px]">
                        {HERO.title}
                    </h1>
                    <p className="max-w-161.25 text-base leading-relaxed font-normal text-c2-navy-560 md:text-xl md:leading-[1.8] lg:text-2xl">
                        {HERO.description}
                    </p>
                    <CreateStoreButton label={HERO.cta} className="rounded-full bg-c2-navy-700" />
                </div>
                <div className="relative -mx-4 md:mx-0 lg:-me-32">
                    <LandingImage
                        asset={HERO.mockup}
                        priority
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="w-full"
                    />
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
