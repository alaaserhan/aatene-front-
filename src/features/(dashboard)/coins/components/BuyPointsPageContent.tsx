"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/hooks/use-language";
import { getTryOnError } from "@/src/features/(web)/virtual-try-on/errors";
import { useGetCoinsPackages, usePurchaseCoinsPackage, useGetStoreBalance } from "../hooks";

/** Package fields arrive as numbers or numeric strings; anything else reads as 0. */
function toNumber(value: number | string | null | undefined): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function BuyPointsPageContent() {
    const router = useRouter();
    const lang = useLanguage();
    const searchParams = useSearchParams();
    const storeId = Cookies.get("current_store_id");
    const { data: packagesData, isLoading: isLoadingPackages, isError: isPackagesError, refetch: refetchPackages } = useGetCoinsPackages();
    const { data: balanceData, isLoading: isLoadingBalance } = useGetStoreBalance(undefined, storeId);
    const { mutate: purchasePackage, isPending: isPurchasing } = usePurchaseCoinsPackage();

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const packages = (packagesData?.packages ?? []).filter((pkg) => pkg.is_active && toNumber(pkg.coins_count) > 0);
    const activePackage = packages.find((pkg) => pkg.id === selectedId)
        ?? packages.find((pkg) => toNumber(pkg.coins_count) === 100)
        ?? packages[0]
        ?? null;

    // The payment gateway sends the merchant back here with the outcome in the query string.
    useEffect(() => {
        if (searchParams.get("status") === "completed" && searchParams.get("success") === "true") {
            const timer = setTimeout(() => setIsSuccessModalOpen(true), 0);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const handleBuy = () => {
        if (!activePackage) {
            toast.error("يرجى اختيار باقة.");
            return;
        }
        const callback = new URL(window.location.href);
        callback.search = "";
        callback.hash = "";

        purchasePackage(
            { body: { package_id: activePackage.id, callback_url: callback.toString() }, storeId },
            {
                onSuccess: (res) => {
                    const paymentUrl = res.transaction?.payment_url;
                    if (!paymentUrl) {
                        setIsSuccessModalOpen(true);
                        return;
                    }
                    try {
                        const destination = new URL(paymentUrl);
                        if (destination.protocol !== "https:" || destination.username || destination.password) throw new Error("Invalid payment URL");
                        window.location.assign(destination.toString());
                    } catch {
                        toast.error("تعذر فتح رابط الدفع. يرجى التواصل مع الدعم.");
                    }
                },
                onError: (error) => {
                    toast.error(getTryOnError(error, "حدث خطأ، يرجى المحاولة مرة أخرى."));
                },
            }
        );
    };

    if (isLoadingPackages) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const price = toNumber(activePackage?.price);
    const coinsCount = toNumber(activePackage?.coins_count);
    const currentBalance = toNumber(balanceData?.balance);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6" dir="rtl">
            <div className="my-2">
                <Breadcrumb
                    items={[
                        { label: "الرئيسية", href: `/${lang}/admin/home` },
                        { label: "شراء عملات ذهبية" },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-8 bg-white h-fit rounded-lg p-4">
                    <div className="space-y-4">
                        <h2 className="text-xl font-medium">اختر الباقة المناسبة لك</h2>
                        {isPackagesError ? (
                            <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
                                <p className="text-sm text-c2-danger">تعذر تحميل الباقات.</p>
                                <Button variant="outline" onClick={() => void refetchPackages()}>إعادة المحاولة</Button>
                            </div>
                        ) : packages.length === 0 ? (
                            <p className="py-10 text-center text-sm text-gray-2">لا تتوفر باقات حاليًا.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="radiogroup" aria-label="باقات العملات">
                                {packages.map((pkg) => {
                                    const isSelected = activePackage?.id === pkg.id;
                                    const isPopular = toNumber(pkg.coins_count) === 100;
                                    return (
                                        <button
                                            type="button"
                                            role="radio"
                                            aria-checked={isSelected}
                                            key={pkg.id}
                                            onClick={() => setSelectedId(pkg.id)}
                                            className={cn(
                                                "relative cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 h-[140px] bg-white",
                                                isSelected ? "border-blue-3 bg-blue-50/20" : "border-gray-200"
                                            )}
                                        >
                                            {isPopular && (
                                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-3 text-white text-[10px] px-3 py-1 rounded-full font-medium shadow-sm whitespace-nowrap">
                                                    الأكثر شيوعًا
                                                </span>
                                            )}
                                            <span className="text-3xl font-medium mb-1 text-blue-4">{toNumber(pkg.coins_count)}</span>
                                            <span className="text-xs text-gray-2 mb-4">عملة ذهبية</span>
                                            <span className="text-xl font-medium">{toNumber(pkg.price)} ₪</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-none bg-white overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                    <Image src="/icons/dashboard/coins.svg" alt="" width={40} height={40} />
                                </div>
                                <div className="space-y-1 flex items-center gap-2">
                                    <div className="font-medium">رصيدك الحالي:</div>
                                    <div className="text-xl font-medium flex items-center gap-1 text-blue-4">
                                        {isLoadingBalance ? <Loader2 className="w-5 h-5 animate-spin text-gray-2" /> : currentBalance}
                                        <span className="text-sm">عملة ذهبية</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-none bg-white overflow-hidden sticky top-4">
                        <CardContent className="p-4 space-y-6">
                            <h2 className="text-xl font-medium">ملخص الطلب</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm text-gray-2">
                                    <span>عدد العملات</span>
                                    <span className="font-medium">{coinsCount} عملة ذهبية</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-2">
                                    <span>السعر</span>
                                    <span className="font-medium">{price} ₪</span>
                                </div>
                                <div className="h-px bg-gray-100 my-4" />
                                <div className="flex justify-between items-center text-lg font-medium text-blue-3">
                                    <span>الإجمالي</span>
                                    <span>{price} ₪</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-100">
                                <div className="text-sm text-gray-2">رصيدك بعد الشراء سيصبح</div>
                                <div className="mr-auto font-medium flex items-center gap-1">
                                    <span>{currentBalance + coinsCount}</span>
                                    <span className="text-xs">عملة ذهبية</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleBuy}
                        disabled={isPurchasing || !activePackage}
                        className="w-full bg-blue-3 hover:bg-blue-3/90 text-white py-6 text-base shadow-lg shadow-blue-3/20 transition-all rounded-lg"
                    >
                        {isPurchasing ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />جارٍ المعالجة...</>
                        ) : (
                            <>ادفع الآن</>
                        )}
                    </Button>
                </div>
            </div>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="تمت العملية بنجاح"
                message="ستُضاف العملات إلى رصيدك بعد تأكيد الدفع."
                buttonText="الذهاب إلى الفواتير"
                onButtonClick={() => {
                    setIsSuccessModalOpen(false);
                    router.push(`/${lang}/admin/financial-record`);
                }}
            />
        </div>
    );
}
