import type { CSSProperties } from "react";

/** The page's `<main>`, which takes focus when the visitor jumps back to the top. */
export const LANDING_TOP_ID = "landing-top";

/** Position in a row of scroll reveals (`ml-reveal`, `ml-pop`...); ignored below `sm`. */
export const staggerStyle = (index: number) => ({ "--ml-n": index }) as CSSProperties;

/** Step in the hero's load-time entrance (`ml-rise`). */
export const riseStyle = (step: number) => ({ "--ml-i": step }) as CSSProperties;
