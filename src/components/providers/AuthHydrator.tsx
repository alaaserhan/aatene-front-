"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useSession } from "@/src/auth/session";

// TODO: remove once all useAuthStore consumers are migrated to useAuth/useUser.
export function AuthHydrator() {
  const { user } = useSession();

  useEffect(() => {
    useAuthStore.getState()._setSession(user);
  }, [user]);

  return null;
}
