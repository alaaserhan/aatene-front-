"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/src/stores/settings-store";

export function SettingsHydrator() {
    const fetchSettings = useSettingsStore(state => state.fetchSettings);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return null;
}
