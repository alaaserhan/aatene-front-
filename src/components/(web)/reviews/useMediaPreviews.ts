"use client";

import { useEffect, useMemo } from "react";

/**
 * Object URLs for a list of picked files, revoked whenever the list changes or
 * the component unmounts. Derived with `useMemo` (not state) so previews are
 * available in the same render the files land in — never one frame late.
 */
export function useMediaPreviews(files: File[]): string[] {
    const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

    useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);

    return urls;
}
