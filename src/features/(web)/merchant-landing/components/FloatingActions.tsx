import BackToTopButton from "./BackToTopButton";
import WhatsAppButton from "./WhatsAppButton";

export default function FloatingActions() {
    return (
        <>
            <div className="pointer-events-none fixed bottom-5 start-5 z-40 md:bottom-6 md:start-6">
                <WhatsAppButton />
            </div>
            <div className="pointer-events-none fixed bottom-5 end-5 z-40 md:bottom-6 md:end-6">
                <BackToTopButton />
            </div>
        </>
    );
}
