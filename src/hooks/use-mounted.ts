import { useSyncExternalStore } from "react";

// Returns false during SSR and initial hydration, true after client mount.
// Use this to defer client-only state that would cause a hydration mismatch.
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
