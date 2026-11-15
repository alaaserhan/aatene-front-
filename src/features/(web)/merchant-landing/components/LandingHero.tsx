import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Logo } from "@/src/components/(web)/Navbar";
import { HEADER_CTA, HERO } from "../content";
import { riseStyle } from "../motion";
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
        <section className="relative flex min-h-svh flex-col overflow-hidden bg-white lg:min-h-[min(100svh,1000px)]">
            <LandingHeader />
            <div className="relative flex flex-1 flex-col">
                {/* The corner sits at 85% of the content column, not of the viewport: past the
                    container's 1400px max width it stops moving, so it stays behind the text. */}
                <div
                    aria-hidden
                    className="absolute inset-0 hidden lg:block"
                    style={{
                        background:
                            "conic-gradient(from 0deg at calc(50% + min(35%, 490px)) 45%, var(--c2-navy-75) 0deg 214.6deg, transparent 215.2deg 320.8deg, var(--c2-navy-75) 321.4deg)",
                    }}
                />
                <MaxWidthWrapper className="grid w-full flex-1 content-center items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:content-stretch lg:gap-8 lg:py-12">
                    <div className="relative z-10 flex min-w-0 flex-col items-center gap-4 text-center">
                        <h1 className="ml-rise text-[30px] font-bold leading-[1.55] text-c2-navy-700 md:text-5xl md:leading-[1.4] lg:text-[42px] xl:text-[56px]">
                            {HERO.title}
                        </h1>
                        <p
                            className="ml-rise max-w-161.25 text-[16px] leading-relaxed font-normal text-c2-navy-560 md:text-xl md:leading-[1.8] xl:text-2xl"
                            style={riseStyle(1)}
                        >
                            {HERO.description}
                        </p>
                        <div className="ml-rise mt-4" style={riseStyle(2)}>
                            <CreateStoreButton label={HERO.cta} className="rounded-full bg-c2-navy-700 text-[18px]" />
                        </div>
                    </div>
                    {/* The asset is pre-cropped on its left edge, so that edge must sit flush with
                        the viewport. Below lg the negative margin cancels the container's padding
                        and side margin; from lg the mockup is positioned against the full-width
                        hero body instead of the grid column. The slide-in lives on an inner
                        wrapper because a transformed ancestor would capture the absolute box. */}
                    <div className="min-w-0 me-[calc(50%_-_50vw)] lg:me-0">
                        <div className="lg:absolute lg:end-0 lg:top-1/2 lg:aspect-1809/1800 lg:h-[min(88%,47vw)] lg:-translate-y-1/2">
                            <div className="ml-slide-in h-full">
                                <LandingImage
                                    asset={HERO.mockup}
                                    priority
                                    sizes="(min-width: 1024px) 47vw, min(100vw, 672px)"
                                    className="ml-float ms-auto w-full max-w-2xl lg:h-full lg:max-w-none"
                                />
                            </div>
                        </div>
                    </div>
                </MaxWidthWrapper>
            </div>
        </section>
    );
}
