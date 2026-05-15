/** الحد الأدنى لكلمات وصف المتجر حتى يقبل الـ webhook توليد كلمات مفتاحية مفيدة */
export const STORE_DESCRIPTION_MIN_WORDS_FOR_AI = 6;

export function countDescriptionWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function getStoreDescriptionValidationError(description: string): string | null {
  const trimmed = description.trim();
  if (!trimmed) {
    return "وصف المتجر مطلوب";
  }
  const words = countDescriptionWords(trimmed);
  if (words < STORE_DESCRIPTION_MIN_WORDS_FOR_AI) {
    return `يجب كتابة الوصف بمقدار ${STORE_DESCRIPTION_MIN_WORDS_FOR_AI} كلمات على الأقل`;
  }
  return null;
}

export function isStoreDescriptionValidForAI(description: string): boolean {
  return getStoreDescriptionValidationError(description) === null;
}
