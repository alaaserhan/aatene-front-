"use client";


import { useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/src/stores/auth-store";
import { getStores } from "@/src/features/(dashboard)/stores/api";
import { Loader2, Store } from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

export function StoreGuard({ children }: { children: ReactNode }) {
    const user = useAuthStore((s) => s.user);
    const isHydrated = useAuthStore((s) => s.isHydrated);
    const [isReady, setIsReady] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const routeParams = useParams();

    const locale =
        typeof routeParams?.locale === "string"
            ? routeParams.locale
            : Array.isArray(routeParams?.locale)
              ? (routeParams.locale[0] ?? "ar")
              : "ar";
    const dashboardType =
        typeof routeParams?.type === "string"
            ? routeParams.type
            : Array.isArray(routeParams?.type)
              ? (routeParams.type[0] ?? "admin")
              : "admin";

    useEffect(() => {
        if (!isHydrated) return;

        const initializeStore = async () => {
            const isMerchant = user?.user_type === "merchant";
            if (!isMerchant) {
                setIsReady(true);
                return;
            }

            const storeId = Cookies.get("current_store_id");
            const storeType = Cookies.get("store_type");

            if (storeId && storeType) {
                const currentPath = pathname || "";

                const isOnProductsPage = currentPath.includes("/products") && !currentPath.includes("/stores");
                const isOnServicesPage = (currentPath.includes("/serviceProviders") || currentPath.includes("/services")) && !currentPath.includes("/stores");

                if ((storeType === "services") && isOnProductsPage) {
                    router.push(`/${locale}/${dashboardType}/serviceProviders/${storeId}`);
                    return;
                }

                if (storeType === "products" && isOnServicesPage) {
                    router.push(`/${locale}/${dashboardType}/products`);
                    return;
                }

                setIsReady(true);
                return;
            }

            try {
                const storeListParams = new URLSearchParams();
                storeListParams.set("status", "approved");
                storeListParams.set("per_page", "100");
                const response = await getStores(storeListParams);
                const approvedStores = (response.data ?? []).filter((s) => s.status === "approved");
                if (approvedStores.length > 0) {
                    const store = approvedStores[0];
                    Cookies.set("current_store_id", store.id.toString(), {
                        expires: 365,
                    });
                    Cookies.set("store_type", store.type, { expires: 365 });
                    if (store.role_in_store) {
                        Cookies.set("store_role", store.role_in_store, { expires: 365 });
                    }
                    window.dispatchEvent(new Event("store-info-updated"));
                    setIsReady(true);
                } else {

                    const isStoresPage = pathname?.includes("/stores");

                    if (!isStoresPage) {
                        setShowModal(true);
                        router.push(`/${locale}/${dashboardType}/stores`);
                    }
                    setIsReady(true);
                }
            } catch (error) {
                console.error("StoreGuard: Failed to fetch stores:", error);
                setIsReady(true);
            }
        };

        initializeStore();
    }, [user, isHydrated, pathname, router, locale, dashboardType]);

    if (!isReady) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <>
            {children}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader className="flex flex-col items-center pt-4">
                        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Store className="w-10 h-10 text-blue-4" strokeWidth={2} />
                            </div>
                        </div>

                        <DialogTitle className="text-xl font-bold text-center text-brand-black-1">
                            تنبيه
                        </DialogTitle>

                        <DialogDescription className="text-center text-gray-2 pt-2">
                            يجب عليك إنشاء متجر أولاً للمتابعة
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col sm:justify-center pt-4">
                        <Button
                            type="button"
                            className="w-full cursor-pointer bg-blue-4 "
                            onClick={() => setShowModal(false)}
                        >
                            حسناً
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
