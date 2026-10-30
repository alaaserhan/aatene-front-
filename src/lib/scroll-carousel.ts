/**
 * Scrolls a horizontal carousel by exactly one item (its width plus the flex
 * gap), so arrows move slide by slide instead of a whole view at a time.
 */
export function scrollCarouselByItem(
  container: HTMLElement | null,
  direction: "left" | "right",
) {
  if (!container) return;
  const firstItem = container.firstElementChild as HTMLElement | null;
  const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
  const step = firstItem ? firstItem.offsetWidth + gap : container.clientWidth;
  container.scrollBy({
    left: direction === "left" ? -step : step,
    behavior: "smooth",
  });
}
