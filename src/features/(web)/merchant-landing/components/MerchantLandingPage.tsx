import "../landing-motion.css";
import { LANDING_TOP_ID } from "../motion";
import BenefitsSection from "./BenefitsSection";
import ComingSoonSection from "./ComingSoonSection";
import FinalCtaSection from "./FinalCtaSection";
import FloatingActions from "./FloatingActions";
import LandingHero from "./LandingHero";
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
