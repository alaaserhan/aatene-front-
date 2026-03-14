"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import Image from "next/image";

export const MetaPixel = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        type WindowWithFB = Window & typeof globalThis & { fbq?: (...args: unknown[]) => void };
        if (typeof window !== "undefined" && (window as WindowWithFB).fbq) {
            (window as WindowWithFB).fbq?.("track", "PageView");
        }
    }, [pathname, searchParams]);

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1509859754473228');
            fbq('track', 'PageView');
          `,
                }}
            />
            <noscript>
                <Image
                    height={1}
                    width={1}
                    style={{ display: "none" }}
                    src="https://www.facebook.com/tr?id=1509859754473228&ev=PageView&noscript=1"
                    alt=""
                    unoptimized
                />
            </noscript>
        </>
    );
};
