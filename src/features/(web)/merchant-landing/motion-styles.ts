/*
 * Motion for the merchant landing page. Inlined into the page's HTML by
 * `MerchantLandingPage` instead of shipped as a stylesheet: in globals.css it pushed the
 * site's main CSS past a TCP slow-start round trip (+150ms FCP), and as its own file it
 * was an extra render-blocking request. Import it only from server components.
 *
 * - CSS only, so nothing waits on hydration, and only `transform` / `opacity` animate.
 * - Keyframes use `transform`, which composes with Tailwind v4's separate `translate` /
 *   `rotate` / `scale` properties instead of overriding them.
 * - Nothing above the fold starts at `opacity: 0`: a hidden hero would delay LCP.
 * - Scroll reveals sit behind `@supports (animation-timeline: view())`; elsewhere the page
 *   is simply static. Each one ends at `entry 100%`, so an element near the bottom of the
 *   page can't get stuck half-faded; `--ml-i` staggers siblings by delaying the start, and
 *   only from `sm`, where cards sit side by side.
 * - The back-to-top ring follows the visitor's own scrolling, so it stays on under reduced
 *   motion; without scroll timelines only its grey track shows.
 * - The `ltr` direction rule must come after the `rtl` one: the root layout is always
 *   `dir="rtl"` and the locale layout nests its own `dir`.
 */
export const LANDING_MOTION_CSS = `
.ml-landing{--ml-dir:1}
[dir="rtl"] .ml-landing{--ml-dir:-1}
[dir="ltr"] .ml-landing{--ml-dir:1}
@keyframes ml-rise{from{transform:translateY(24px)}}
@keyframes ml-slide-in{from{transform:translateX(calc(8% * var(--ml-dir))) scale(.96)}}
@keyframes ml-float{50%{transform:translateY(-12px)}}
@keyframes ml-drift{to{transform:translate(14px,18px) scale(1.06)}}
@keyframes ml-shine{0%{transform:translateX(calc(-100% * var(--ml-dir)))}25%,100%{transform:translateX(calc(100% * var(--ml-dir)))}}
@keyframes ml-pulse{0%{transform:scale(1);opacity:.55}60%,100%{transform:scale(1.18,1.45);opacity:0}}
@keyframes ml-reveal{from{opacity:0;transform:translateY(40px)}}
@keyframes ml-reveal-side{from{opacity:0;transform:translateX(calc(-32px * var(--ml-dir)))}}
@keyframes ml-pop{0%{opacity:0;transform:scale(.3)}70%{opacity:1;transform:scale(1.18)}}
@keyframes ml-parallax{0%{transform:translateY(56px) scale(.94)}50%{transform:none}100%{transform:translateY(-24px)}}
@keyframes ml-scroll-progress{to{stroke-dashoffset:0}}
.ml-scroll-progress{visibility:hidden}
@supports (animation-timeline:scroll()){
.ml-scroll-progress{visibility:visible;animation:ml-scroll-progress linear both;animation-timeline:scroll(root)}
}
@media (prefers-reduced-motion:no-preference){
.ml-rise{animation:ml-rise .8s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--ml-i,0) * 120ms)}
.ml-slide-in{animation:ml-slide-in 1s cubic-bezier(.2,.7,.2,1) both}
.ml-float{animation:ml-float 6s ease-in-out 1s infinite}
.ml-drift{animation:ml-drift 9s ease-in-out infinite alternate}
.ml-drift-slow{animation:ml-drift 13s ease-in-out infinite alternate-reverse}
.ml-shine{position:relative;overflow:hidden}
.ml-shine::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 30%,rgb(255 255 255/.35) 50%,transparent 70%);transform:translateX(calc(-100% * var(--ml-dir)));animation:ml-shine 4.5s ease-in-out 1.2s infinite}
.ml-shine svg{transition:transform .2s ease}
.ml-shine:hover svg{transform:translateX(-4px)}
.ml-pulse{position:relative;display:inline-flex;border-radius:9999px}
.ml-pulse::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;border:2px solid var(--c2-primary);pointer-events:none;animation:ml-pulse 2.6s ease-out infinite}
@supports (animation-timeline:view()){
.ml-reveal,.ml-reveal-side,.ml-pop{animation-timing-function:linear;animation-fill-mode:both;animation-timeline:view();animation-range:entry calc(var(--ml-i,0) * 12%) entry 100%}
@media (min-width:40rem){.ml-reveal,.ml-reveal-side,.ml-pop{--ml-i:var(--ml-n,0)}}
.ml-reveal{animation-name:ml-reveal}
.ml-reveal-side{animation-name:ml-reveal-side}
.ml-pop{animation-name:ml-pop}
.ml-parallax{animation:ml-parallax linear both;animation-timeline:view();animation-range:cover}
}
}
`;
