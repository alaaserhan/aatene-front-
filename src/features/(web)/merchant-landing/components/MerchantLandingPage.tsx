import BenefitsSection from "./BenefitsSection";
import ComingSoonSection from "./ComingSoonSection";
import FinalCtaSection from "./FinalCtaSection";
import LandingHero from "./LandingHero";
import OutcomesSection from "./OutcomesSection";
import ShowcaseSection from "./ShowcaseSection";
import TrustStrip from "./TrustStrip";
import WhatsAppButton from "./WhatsAppButton";

export default function MerchantLandingPage() {
    return (
        <main className="min-h-screen overflow-x-clip bg-white">
            <LandingHero />
            <TrustStrip />
            <BenefitsSection />
            <ShowcaseSection />
            <ComingSoonSection />
            <OutcomesSection />
            <FinalCtaSection />
            <WhatsAppButton />
        </main>
    );
}
