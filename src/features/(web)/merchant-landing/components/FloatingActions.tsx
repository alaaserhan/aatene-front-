import BackToTopButton from "./BackToTopButton";
import WhatsAppButton from "./WhatsAppButton";

/** One fixed stack in the bottom corner, so the floating buttons never overlap each other. */
export default function FloatingActions() {
    return (
        <div className="pointer-events-none fixed bottom-5 end-5 z-40 flex flex-col items-center gap-3 md:bottom-6 md:end-6">
            <BackToTopButton />
            <WhatsAppButton />
        </div>
    );
}
