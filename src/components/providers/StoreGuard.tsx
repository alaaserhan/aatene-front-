"use client";

import { useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/src/stores/auth-store";
import { getStores } from "@/src/features/(dashboard)/stores/api";
import { Loader2 } from "lucide-react";

export function StoreGuard({ children }: { children: ReactNode }) {
    const user = useAuthStore((s) => s.user);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initializeStore = async () => {
            // 1. Check if user is a merchant
            const isMerchant = user?.user_type === "merchant";
            if (!isMerchant) {
                setIsReady(true);
                return;
            }

            // 2. Check if current_store_id is already set
            const storeId = Cookies.get("current_store_id");
            if (storeId) {
                setIsReady(true);
                return;
            }

            // 3. Fetch stores and set the default store ID
            try {
                const response = await getStores(new URLSearchParams());
                if (response.data && response.data.length > 0) {
                    Cookies.set("current_store_id", response.data[0].id.toString(), { expires: 365 });
                    Cookies.set("store_type", response.data[0].type, { expires: 365 });
                    // Dispatch event to notify other components (e.g. Navbar)
                    window.dispatchEvent(new Event("store-info-updated"));
                }
            } catch (error) {
                console.error("StoreGuard: Failed to fetch stores:", error);
            }

            setIsReady(true);
        };

        initializeStore();
    }, [user]);

    if (!isReady) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return <>{children}</>;
}
