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

/**
 * The backend sends booleans as true/false, 1/0 or "1"/"0", so a plain
 * truthiness check would read the string "0" as enabled.
 * `fallback` is returned when the flag is missing entirely.
 */
export const isSettingFlagEnabled = (
    value: boolean | number | string | null | undefined,
    fallback = false
): boolean => {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "string") return value !== "0" && value !== "false";
    return !!value;
};

/**
 * Whether the AI chat bot is enabled platform-wide.
 * Defaults to enabled while the settings haven't loaded yet or when the
 * backend omits the flag — only an explicit falsy value hides the bot.
 */
export const useIsChatBotAllowed = (): boolean => {
    const settings = useSettingsStore((state) => state.settings);
    return isSettingFlagEnabled(settings?.is_chat_bot_allowed, true);
};
