import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Logo } from "@/src/components/(web)/Navbar";
import { cn } from "@/src/lib/utils";
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
                <MaxWidthWrapper className="relative grid w-full flex-1 content-center items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:content-stretch lg:gap-8 lg:py-12">
                    <div className="relative z-10 flex min-w-0 flex-col items-center gap-4 text-center">
                        <h1 className="text-[30px] font-bold leading-[1.55] text-c2-navy-700 md:text-5xl md:leading-[1.4] lg:text-[42px] xl:text-[56px]">
                            {HERO.title}
                        </h1>
                        <p className="max-w-161.25 text-base leading-relaxed font-normal text-c2-navy-560 md:text-xl md:leading-[1.8] xl:text-2xl">
                            {HERO.description}
                        </p>
                        <CreateStoreButton label={HERO.cta} className="mt-4 rounded-full bg-c2-navy-700" />
                    </div>
                    {/* From lg the mockup is sized by the hero's height and anchored to the
                        column's start edge, so it bleeds off the far side of the viewport
                        instead of shrinking to the column or reaching under the text.
                        From 2400px the side margin is too wide for a convincing bleed (only the
                        laptop's edge would be clipped), so the mockup is instead fitted whole
                        into the space between the viewport edge and the text. The width adds
                        that margin to the column: 700px is half the container's max width.
                        The breakpoint is written in rem on purpose: Tailwind emits a px
                        breakpoint before the rem-based `lg:` rules, which then override it. */}
                    <div className="relative min-w-0 lg:self-stretch">
                        <LandingImage
                            asset={HERO.mockup}
                            priority
                            sizes="(min-width: 150rem) 1304px, (min-width: 1024px) 85vw, 100vw"
                            className={cn(
                                "mx-auto w-full max-w-2xl",
                                "lg:absolute lg:start-0 lg:top-1/2 lg:mx-0 lg:h-[min(92%,47vw)] lg:max-h-180 lg:w-auto lg:max-w-none lg:-translate-y-1/2",
                                "min-[150rem]:h-[92%] min-[150rem]:w-[calc(100%_+_50vw_-_700px_-_2rem)] min-[150rem]:object-contain ltr:min-[150rem]:object-left rtl:min-[150rem]:object-right",
                            )}
                        />
                    </div>
                </MaxWidthWrapper>
            </div>
        </section>
    );
}
