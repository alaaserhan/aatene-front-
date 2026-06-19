import { onSignOut } from "@/src/auth";
import { clearStoreContext } from "./cookies";

// Side-effect registration: when the user signs out, drop the store-context
// cookies so the next login doesn't inherit the previous merchant's selection.
//
// This module must be imported at app boot (see src/app/layout.tsx) so the
// listener is in place before any sign-out can fire.
onSignOut(clearStoreContext);

export {
  CURRENT_STORE_ID_COOKIE,
  STORE_TYPE_COOKIE,
  STORE_ROLE_COOKIE,
  STORE_CONTEXT_UPDATED_EVENT,
  setStoreContext,
  clearStoreContext,
  getStoreContext,
  type StoreContext,
  type ReadStoreContext,
} from "./cookies";
