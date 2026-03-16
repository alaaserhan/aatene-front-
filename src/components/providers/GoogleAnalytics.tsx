"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

export const GoogleAnalytics = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // ⚡ تأجيل التحميل لحد ما اليوزر يعمل interaction
        const load = () => setShouldLoad(true);
        
        // بيحمل على أول interaction أو بعد 3 ثواني (بدل 2)
        window.addEventListener("mousemove", load, { once: true });
        window.addEventListener("touchstart", load, { once: true });
        window.addEventListener("scroll", load, { once: true, passive: true });
        
        const timer = setTimeout(load, 3000); // زيادة من 2 لـ 3 ثواني
        
        return () => {
            window.removeEventListener("mousemove", load);
            window.removeEventListener("touchstart", load);
            window.removeEventListener("scroll", load);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!shouldLoad) return;
        const url = pathname + searchParams.toString();
        // Fire analytics events cleanly on router change
        type WindowWithGtag = Window & typeof globalThis & { gtag?: (...args: unknown[]) => void };
        if (typeof window !== "undefined" && (window as WindowWithGtag).gtag) {
            (window as WindowWithGtag).gtag?.('config', 'G-38DS6YHG9H', {
                page_path: url,
            });
            (window as WindowWithGtag).gtag?.('config', 'AW-10825269964', {
                page_path: url,
            });
        }
    }, [pathname, searchParams, shouldLoad]);

    if (!shouldLoad) return null;

    return (
        <>
            <Script
                id="google-analytics-external"
                strategy="lazyOnload"
                src="https://www.googletagmanager.com/gtag/js?id=G-38DS6YHG9H"
            />
            <Script
                id="google-analytics-internal"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-38DS6YHG9H');
                        gtag('config', 'AW-10825269964');
                    `,
                }}
            />
        </>
    );
};