// src/features/(dashboard)/services/components/form/useServiceForm.ts
"use client";

import { useCallback, useState } from "react";
import {
  ServiceFormErrors,
  ServiceFormValues,
  emptyServiceFormValues,
} from "./types";

/** Order of the basic-step fields — used to scroll to the first error */
const BASIC_FIELD_ORDER: (keyof ServiceFormValues)[] = [
  "title",
  "images",
  "category_id",
  "section_id",
  "price",
];

export function useServiceForm(initialValues?: Partial<ServiceFormValues>) {
  const [values, setValues] = useState<ServiceFormValues>({
    ...emptyServiceFormValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<ServiceFormErrors>({});

  /** Updates a single field and clears its error (if any) automatically */
  const setField = useCallback(
    <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  /** Validates the basic step only (the advanced step is entirely optional) */
  const validateBasic = useCallback((): ServiceFormErrors => {
    const next: ServiceFormErrors = {};

    if (!values.title.trim()) next.title = "عنوان الخدمة مطلوب";
    if (values.images.length === 0)
      next.images = "صورة الخدمة مطلوبة، أضف صورة واحدة على الأقل";
    if (!values.category_id) next.category_id = "الفئة مطلوبة";
    if (!values.section_id) next.section_id = "القسم مطلوب";

    if (!values.ask_for_price) {
      if (values.price === "" || Number(values.price) <= 0) {
        next.price = "السعر مطلوب عند اختيار إظهار السعر";
      } else if (Number(values.price) < 0) {
        next.price = "السعر لا يمكن أن يكون أقل من صفر";
      }
    }

    return next;
  }, [values]);

  /** Scrolls the page to the first invalid field following the form order */
  const focusFirstError = useCallback((fieldErrors: ServiceFormErrors) => {
    const firstKey = BASIC_FIELD_ORDER.find((key) => fieldErrors[key]);
    const el = firstKey ? document.getElementById(firstKey) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    values,
    errors,
    setValues,
    setField,
    setErrors,
    validateBasic,
    focusFirstError,
  };
}

export type UseServiceFormReturn = ReturnType<typeof useServiceForm>;
