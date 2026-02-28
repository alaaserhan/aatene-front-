import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { GlobalSettingsData, getGlobalSettings } from "@/src/features/(web)/settings/api";

interface SettingsState {
    settings: GlobalSettingsData | null;
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: null,
            isLoading: false,
            fetchSettings: async () => {
                set({ isLoading: true });
                try {
                    const res = await getGlobalSettings();
                    if (res.status && res.settings) {
                        set({ settings: res.settings, isLoading: false });
                    } else {
                        set({ isLoading: false });
                    }
                } catch (error) {
                    console.error("Failed to fetch global settings", error);
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: "global-settings",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
