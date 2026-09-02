"use client";

import { useEffect } from "react";

export function CssLoader() {
  useEffect(() => {
    import("@/src/app/globals.css");
  }, []);
  return null;
}
