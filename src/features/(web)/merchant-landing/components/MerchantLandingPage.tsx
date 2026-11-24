import { LANDING_TOP_ID } from "../motion";
import { LANDING_MOTION_CSS } from "../motion-styles";
import BenefitsSection from "./BenefitsSection";
import ComingSoonSection from "./ComingSoonSection";
import FinalCtaSection from "./FinalCtaSection";
import FloatingActions from "./FloatingActions";
import LandingHero, { LandingHeader } from "./LandingHero";
import OutcomesSection from "./OutcomesSection";
import ShowcaseSection from "./ShowcaseSection";
import TrustStrip from "./TrustStrip";

export default function MerchantLandingPage() {
    return (
        <main
            id={LANDING_TOP_ID}
            tabIndex={-1}
            className="ml-landing min-h-screen overflow-x-clip bg-white outline-none max-md:[&_.container]:px-[20px]!"
        >
            {/* React hoists it into <head> and renders it once, however often the page mounts. */}
            <style href="merchant-landing-motion" precedence="default">
                {LANDING_MOTION_CSS}
            </style>
            <LandingHeader />
            <LandingHero />
            <TrustStrip />
            <BenefitsSection />
            <ShowcaseSection />
            <ComingSoonSection />
            <OutcomesSection />
            <FinalCtaSection />
            <FloatingActions />
        </main>
    );
}
