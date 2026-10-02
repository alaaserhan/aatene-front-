/**
 * Backend attribute titles that read awkwardly in an "اختر ..." prompt,
 * mapped to the noun the dropdown placeholder should use instead.
 */
const PLACEHOLDER_NOUNS: Record<string, string> = {
  "مقاسات الملابس": "المقاس",
};

/** Placeholder for an attribute select, e.g. "اختر اللون" / "اختر المقاس". */
export function getAttributePlaceholder(title: string): string {
  return `اختر ${PLACEHOLDER_NOUNS[title.trim()] ?? title}`;
}
