import type { RequestedService } from "./types";

// IDs are compared as strings: the API and the session store don't agree on number vs string.
export function isRequestedServiceOwner(
    ownerId: number | string | null | undefined,
    currentUserId: number | string | null | undefined,
): boolean {
    if (ownerId == null || currentUserId == null) return false;
    return String(ownerId) === String(currentUserId);
}

// Trusts the backend's `is_owner` flag; falls back to comparing ids on payloads that lack it.
export function isOwnRequestedService(
    service: Pick<RequestedService, "is_owner" | "user">,
    currentUserId: number | string | null | undefined,
): boolean {
    if (typeof service.is_owner === "boolean") return service.is_owner;
    return isRequestedServiceOwner(service.user?.id, currentUserId);
}
