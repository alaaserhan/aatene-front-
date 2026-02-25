"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export const GoogleAnalytics = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
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
    }, [pathname, searchParams]);

    return (
        <>
            <Script
                id="google-analytics-external"
                strategy="afterInteractive"
                src="https://www.googletagmanager.com/gtag/js?id=G-38DS6YHG9H"
            />
            <Script
                id="google-analytics-internal"
                strategy="afterInteractive"
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
