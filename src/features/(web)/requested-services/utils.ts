// IDs are compared as strings: the API and the session store don't agree on number vs string.
export function isRequestedServiceOwner(
    ownerId: number | string | null | undefined,
    currentUserId: number | string | null | undefined,
): boolean {
    if (ownerId == null || currentUserId == null) return false;
    return String(ownerId) === String(currentUserId);
}
