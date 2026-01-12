"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCoinsPackages, usePurchaseCoinsPackage, useGetStoreBalance } from "../hooks";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent } from "@/src/components/ui/card";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { FormInput } from "@/src/components/ui/FormInput";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

export function BuyPointsPageContent() {
    const router = useRouter();
    const { data: packagesData, isLoading: isLoadingPackages } = useGetCoinsPackages();
    const { data: balanceData, isLoading: isLoadingBalance } = useGetStoreBalance();
    const { mutate: purchasePackage, isPending: isPurchasing } = usePurchaseCoinsPackage();

    // State
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Form State (Visual Only as per requirements)
    const [countryCode, setCountryCode] = useState("+970");
    const [phoneNumber, setPhoneNumber] = useState("");

    const packages = packagesData?.packages || [];

    // Derive the active package
    const activePackage = packages.find(p => p.id === selectedId) ||
        (packages.length > 0 ? packages.find(p => p.coins_count === "100") : null) ||
        packages[0] || null;

    const handleBuy = () => {
        if (!activePackage) {
            toast.error("الرجاء اختيار باقة");
            return;
        }

        purchasePackage(
            { package_id: activePackage.id },
            {
                onSuccess: () => {
                    setIsSuccessModalOpen(true);
                }
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

    // Calculate totals
    const price = activePackage ? parseFloat(activePackage.price) : 0;
    const coinsCount = activePackage ? parseInt(activePackage.coins_count) : 0;
    const currentBalance = balanceData?.balance ? parseInt(balanceData.balance) : 0;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6" dir="rtl">

            {/* Header: Breadcrumb */}
            <div className="my-2">
                <Breadcrumb
                    items={[
                        { label: "الرئيسية", href: "/admin" },
                        { label: "شراء عملات ذهبية" }
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* PART 1: Packages & Form (Main Content) */}
                <div className="lg:col-span-8 space-y-8 bg-white rounded-lg p-4">

                    {/* 1. Select Package Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-medium">اختر الباقة المناسبة لك</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {packages.map((pkg) => {
                                const isSelected = activePackage?.id === pkg.id;
                                const isPopular = pkg.coins_count === "100";

                                return (
                                    <div
                                        key={pkg.id}
                                        onClick={() => setSelectedId(pkg.id)}
                                        className={cn(
                                            "relative cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 h-[140px] bg-white",
                                            isSelected
                                                ? "border-blue-3 bg-blue-50/20"
                                                : "border-gray-200 hover:border-gray-200"
                                        )}
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-3 text-white text-[10px] px-3 py-1 rounded-full font-medium shadow-sm whitespace-nowrap">
                                                الأكثر شيوعاً
                                            </div>
                                        )}

                                        <div className="text-3xl font-medium mb-1 text-blue-4">
                                            {pkg.coins_count}
                                        </div>
                                        <div className="text-xs text-gray-2 mb-4">
                                            عملة ذهبية
                                        </div>
                                        <div className="text-xl font-medium">
                                            {parseFloat(pkg.price)} ₪
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 2. Custom Amount Input */}
                    <div>
                        <Label className="text-base font-medium mb-3 block text-gray-700">أو اكتب عدد العملات الذهبية</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            disabled
                            className="bg-white border-gray-200 h-11"
                        />
                    </div>

                    {/* 3. Payment Details Form */}
                    <div className="space-y-6 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium">أدخل بيانات الدفع</h2>
                        </div>

                        <div className="space-y-5">
                            {/* Row 1: Card Number + Exp + CVV */}
                            <div className="grid grid-cols-12 gap-5">
                                <div className="col-span-12 md:col-span-6">
                                    <Label className="mb-2 block  text-gray-700">رقم البطاقة الائتمانية</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="0000 0000 0000 0000"
                                            className=" h-10 rounded-lg border-gray-200 focus-visible:ring-blue-3"
                                            readOnly
                                        />
                                        {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2 opacity-80">
                                            <div className="h-6 w-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[8px] font-medium text-blue-900">VISA</div>
                                            <div className="h-6 w-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[8px] font-medium text-red-600">Master</div>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="col-span-6 md:col-span-3">
                                    <Label className="mb-2 block  text-gray-700">Exp</Label>
                                    <Input placeholder="00/00" className="text-center h-10 rounded-lg border-gray-200 focus-visible:ring-blue-3" readOnly />
                                </div>
                                <div className="col-span-6 md:col-span-3">
                                    <Label className="mb-2 block  text-gray-700">CVV</Label>
                                    <Input placeholder="000" className="text-center h-10 rounded-lg border-gray-200 focus-visible:ring-blue-3" readOnly />
                                </div>
                            </div>

                            {/* Row 2: First Name + Last Name */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <Label className="mb-2 block  text-gray-700">الاسم الأول</Label>
                                    <Input placeholder="اسم صاحب البطاقة" className=" h-10 rounded-lg border-gray-200 focus-visible:ring-blue-3" readOnly />
                                </div>
                                <div>
                                    <Label className="mb-2 block  text-gray-700">اسم العائلة</Label>
                                    <Input placeholder="اسم صاحب البطاقة" className=" h-10 rounded-lg border-gray-200 focus-visible:ring-blue-3" readOnly />
                                </div>
                            </div>

                            {/* Row 3: Phone Number */}
                            <div>
                                <PhoneNumberInput
                                    label="رقم الهاتف"
                                    countryCode={countryCode}
                                    onCountryCodeChange={setCountryCode}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="00000000"
                                    containerClassName="w-full"
                                    readOnly // Make visual only as per original request, though component might be interactive
                                />
                            </div>

                            {/* Row 4: Address */}
                            <div>
                                <FormInput
                                    label="العنوان"
                                    placeholder="العنوان"
                                    className="h-10 rounded-lg border-gray-200 focus:ring-blue-3"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* PART 2: Balance & Payment (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Current Balance Card */}
                    <Card className="border-none shadow-none bg-white overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                    <Image src="/icons/dashboard/coins.svg" alt="coins" width={40} height={40} />
                                </div>
                                <div className="space-y-1 flex items-center gap-2">
                                    <div className=" font-medium">رصيدك الحالي:</div>
                                    <div className="text-xl font-medium flex items-center gap-1 text-blue-4">
                                        {isLoadingBalance ? <Loader2 className="w-5 h-5 animate-spin text-gray-2" /> : currentBalance}
                                        <span className="text-sm ">عملة ذهبية</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary & Payment Action */}
                    <Card className="border-none shadow-none bg-white overflow-hidden sticky top-4">
                        <CardContent className="p-4 space-y-6">
                            <h2 className="text-xl font-medium flex items-center gap-2">
                                ملخص الطلب
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm text-gray-2">
                                    <span>عدد العملات</span>
                                    <span className="font-medium">{coinsCount} عملة ذهبية</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-2">
                                    <span>السعر</span>
                                    <span className="font-medium">{price} ₪ </span>
                                </div>

                                <div className="h-px bg-gray-100 my-4" />

                                <div className="flex justify-between items-center text-lg font-medium text-blue-3">
                                    <span>الاجمالي</span>
                                    <span>{price} ₪ </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-100">
                                <div className="text-sm text-gray-2">
                                    رصيدك بعد الشراء سيصبح
                                </div>
                                <div className="mr-auto font-medium flex items-center gap-1 ">
                                    <span>{currentBalance + coinsCount}</span>
                                    <span className="text-xs "> عملة ذهبية</span>
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
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                جاري المعالجة...
                            </>
                        ) : (
                            <>
                                ادفع الآن
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="تمت العملية بنجاح"
                message={`تمت اضافة ${coinsCount} عملة ذهبية إلى حسابك`}
                buttonText="الذهاب الى الفواتير"
            />
        </div>
    );
}
