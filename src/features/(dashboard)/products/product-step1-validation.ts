import { Step1FormData } from "./types";

export function normalizeProductCondition(
  condition: string | null | undefined
): "new" | "used" {
  return condition === "used" ? "used" : "new";
}

/** تحقق خطوة 1 — يُستخدم في الإضافة والتعديل */
export function validateProductStep1(formData: Step1FormData): Record<string, string> {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) {
    newErrors.name = "اسم المنتج مطلوب";
  }

  if (!formData.description.trim()) {
    newErrors.description = "وصف المنتج مطلوب";
  }

  if (!formData.cover) {
    newErrors.cover = "صورة المنتج مطلوبة (يجب إضافة صورة واحدة على الأقل)";
  }

  if (!formData.category_id) {
    newErrors.category_id = "الفئة مطلوبة";
  }

  if (formData.ask_for_price) {
    if (formData.price < 0) {
      newErrors.price = "لا يمكن أن يكون السعر أقل من صفر";
    }
  } else if (!formData.price || Number(formData.price) <= 0) {
    newErrors.price = "السعر مطلوب عند اختيار إظهار السعر";
  } else if (formData.price < 0) {
    newErrors.price = "لا يمكن أن يكون السعر أقل من صفر";
  }

  return newErrors;
}
