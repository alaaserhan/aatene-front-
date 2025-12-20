// src/features/(dashboard)/services/components/ServiceDetailsPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Phone,
    Send,
    Share2,
    PenLine,
    Check,
    CheckCircle2,
    Pen,
} from "lucide-react";
import { useGetService, useUpdateServiceStatus } from "../hooks";
import { useGetSingleStore } from "../../stores/hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { RejectServiceModal } from "./RejectServiceModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { toast } from "sonner";
import { ProviderInfoCard } from "@/src/components/(dashboard)/ProviderInfoCard";

interface ServiceDetailsPageProps {
    serviceId: number;
    storeId: number;
}

export function ServiceDetailsPage({ serviceId, storeId }: ServiceDetailsPageProps) {
    const router = useRouter();
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // جلب بيانات الخدمة
    const { data: serviceData, isLoading } = useGetService(serviceId, storeId);
    const service = serviceData?.data;

    // جلب بيانات المتجر
    const { data: storeData } = useGetSingleStore(storeId);
    const store = storeData?.record;

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateServiceStatus();

    const handleApprove = () => {
        updateStatus({
            id: serviceId,
            payload: { status: "approved" },
            storeId
        }, {
            onSuccess: () => {
                toast.success("تم قبول الخدمة بنجاح");
                router.refresh();
            }
        });
    };

    const handleRejectClick = () => {
        setIsRejectModalOpen(true);
    };

    const confirmReject = (reasonId: string, note: string) => {
        updateStatus({
            id: serviceId,
            payload: {
                status: "rejected",
                reason_id: reasonId,
                reason: note
            },
            storeId
        }, {
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setIsSuccessModalOpen(true);
            }
        });
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>;
    if (!service) return <div className="flex h-screen items-center justify-center">الخدمة غير موجودة</div>;

    const breadcrumbItems = [
        { label: "مقدمي الخدمات", href: "/admin/serviceProviders" },
        { label: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "تفاصيل المتجر", href: `/admin/serviceProviders/${storeId}` },
        { label: service.title, href: `/admin/serviceProviders/services/${storeId}/${service.id}` },
    ];

    // معالجة الصور (التأكد من أنها مصفوفة)
    const imagesList = Array.isArray(service.images_urls) ? service.images_urls : (service.images_urls ? [service.images_urls] : []);
    const mainImage = imagesList.length > 0 ? imagesList[0] : "/placeholder-service.jpg";

    return (
        <div className="flex flex-col pb-10">
            {/* Header Area */}
            <div>
                <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />

                {/* Action Bar */}
                <div className="container mx-auto mt-4 px-4 md:px-0">
                    <div className="px-6 py-4 flex items-center justify-between border border-gray-100 bg-white rounded-lg">
                        <h2 className="text-lg font-bold ">اختر الاجراء المناسب للخدمة</h2>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleApprove}
                                disabled={isUpdating}
                                className="bg-[#34D399] hover:bg-[#2cb683] text-white px-8 h-10 font-bold rounded "
                            >
                                قبول الخدمة
                            </Button>
                            <Button
                                onClick={handleRejectClick}
                                disabled={isUpdating}
                                className="bg-[#EF4444] hover:bg-[#d93838] text-white px-8 h-10 font-bold rounded "
                            >
                                رفض الخدمة
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-0 mt-6">
                <div className="grid grid-cols-12 gap-6">

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl p-4  border border-gray-100">
                            {/* Title & Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold  leading-tight max-w-[70%]">
                                    {service.title}
                                </h1>
                                <div className="flex gap-4 text-gray-400">
                                    <button className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer">
                                        <Share2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">مشاركة الخدمة</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer" onClick={() => router.push(`/admin/serviceProviders/services/edit/${serviceId}/${storeId}`)}>
                                        <Pen className="w-4 h-4" />
                                        <span className="text-sm font-medium">تعديل الخدمة</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Image */}
                            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100 bg-gray-50 ">
                                <img
                                    src={mainImage}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Thumbnails */}
                            {imagesList.length > 1 && (
                                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                                    {imagesList.map((img, idx) => (
                                        <div key={idx} className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:border-blue-500 transition-colors">
                                            <img
                                                src={img}
                                                alt={`thumb-${idx}`}
                                                className="w-full h-full object-cover opacity-80 hover:opacity-100"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Provider Info Card (Reusable Component) */}
                            {store && (
                                <div className="mb-6">
                                    <ProviderInfoCard store={store} />
                                </div>
                            )}

                            {/* Description Section */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold  mb-4">تفاصيل الخدمة</h3>
                                <div
                                    className="text-gray-600 leading-relaxed whitespace-pre-line text-sm"
                                    dangerouslySetInnerHTML={{ __html: service.description }}
                                />
                            </div>

                            {/* Specialties Section (Corrected rendering) */}
                            {service.specialties && service.specialties.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold  mb-3">مجالات الخدمة:</h3>
                                    <ul className="space-y-2">
                                        {/* هنا تم التعديل للوصول إلى title داخل الأوبجكت */}
                                        {service.specialties.map((item: any, idx) => (
                                            <li key={item.id || idx} className="flex items-center gap-2 text-gray-700 text-sm">
                                                <div className="text-green-500">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                {/* التحقق مما إذا كان item كائن أو نص */}
                                                {typeof item === 'object' ? item.title : item}
                                            </li> 
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Features List (Static Example) */}
                            {/* <div className="mb-8">
                                <h3 className="text-sm font-bold  mb-3">مميزات الخدمة:</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check className="w-4 h-4 " /> استشارة مباشرة من محام مرخص</li>
                                    <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check className="w-4 h-4 " /> رد سريع خلال دقائق</li>
                                    <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check className="w-4 h-4 " /> سرية تامة ومهنية عالية</li>
                                    <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check className="w-4 h-4 " /> متوفرة عبر الهاتف أو الرسائل أو الفيديو</li>
                                </ul>
                                <p className="mt-4 text-sm font-bold ">لا تنتظر حتى تتفاقم المشكلة - احصل على إجابة قانونية الآن!</p>
                            </div> */}

                            {/* FAQ Section */}
                            {service.questions && service.questions.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold  mb-1">الأسئلة الشائعة (اختياري)</h3>
                                    <p className="text-gray-400 text-xs mb-6">اكتب إجابات للأسئلة الشائعة التي يطرحها عميلك. أضف حتى خمسة أسئلة.</p>

                                    <div className="space-y-6">
                                        {service.questions.map((q, idx) => (
                                            <div key={idx} className="border-b border-gray-50 pb-4 last:border-0">
                                                <h4 className="font-bold  text-sm mb-2">{idx + 1}. {q.question}</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">{q.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl p-6  border border-gray-100 h-fit">

                            {/* Category Section */}
                            <div className="grid grid-cols-2 py-4 border-b border-gray-100">
                                <div className="t">
                                    <p className=" font-bold text-sm mb-1">التصنيف الرئيسي</p>
                                    <p className="text-gray-500 text-sm">{service.section?.name || "-"}</p>
                                </div>
                                <div className="">
                                    <p className=" font-bold text-sm mb-1">التصنيف الفرعي</p>
                                    <p className="text-gray-500 text-sm">{service.category?.name || "-"}</p>
                                </div>
                            </div>

                            {/* Price & Delivery Section */}
                            <div className="grid grid-cols-2 py-4 border-b border-gray-100">
                                <div className="t">
                                    <p className=" font-bold text-sm mb-1">سعر الخدمة</p>
                                    <p className="text-gray-500 text-sm font-medium">₪ {service.price}</p>
                                </div>
                                <div className="">
                                    <p className=" font-bold text-sm mb-1">التسليم خلال</p>
                                    <p className="text-gray-500 text-sm">{service.execute_count} {service.execute_type}</p>
                                </div>
                            </div>

                            {/* Cities Section (Fixed to use store.serviceCities) */}
                            <div className="py-4 border-b border-gray-100">
                                <p className=" font-bold text-sm mb-3">المدن التي يمكنه العمل بها</p>
                                <div className="flex flex-wrap gap-2">
                                    {store?.serviceCities && store.serviceCities.length > 0 ? (
                                        store.serviceCities.map((city) => (
                                            <span key={city.id} className="px-3 py-1 bg-[#F0F4F8] text-[#3A5779] text-xs rounded-full font-medium border border-[#E1E8F0]">
                                                {city.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400">لا توجد مدن محددة</span>
                                    )}
                                </div>
                            </div>

                            {/* Keywords Section (Corrected rendering) */}
                            <div className="py-4 mb-4">
                                <p className=" font-bold text-sm mb-2">الكلمات المفتاحية</p>
                                <div className="flex flex-wrap gap-1">
                                    {/* التعديل هنا لطباعة title من الاوبجكت */}
                                    {service.tags && service.tags.length > 0 ? (
                                        service.tags.map((tag: string | { id: number; title: string }, idx: number) => (
                                            <span key={idx} className="text-gray-500 text-xs leading-relaxed bg-gray-50 px-2 py-1 rounded">
                                                {typeof tag === 'object' ? tag.title : tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs">لا توجد كلمات مفتاحية</span>
                                    )}
                                </div>
                            </div>

                            {/* Contact Buttons */}
                            <div className="flex flex-col gap-3">
                                <Button className="w-full bg-[#3A5779] hover:bg-[#2c425e] text-white font-bold h-12 rounded-lg gap-2 text-sm ">
                                    <span>{store?.phone || "+972 *** *** ***"}</span>
                                    <Phone className="w-5 h-5 " />
                                </Button>
                                <Button variant="outline" className="w-full border-[#3A5779] text-[#3A5779] bg-transparent font-bold h-12 rounded-lg gap-2 text-sm">
                                    <span>دردشة</span>
                                    <Send className="w-5 h-5 rotate-45" />
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <RejectServiceModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={confirmReject}
                isLoading={isUpdating}
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    router.push('/admin/serviceProviders');
                }}
                title="تم رفض الخدمة بنجاح"
            />
        </div>
    );
}