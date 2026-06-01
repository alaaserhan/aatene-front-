import { CheckCircle2, PauseCircle, X, XCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

type StatusType = "approved" | "rejected" | "pending" | "deactivated" | string;

interface PreviewStatusAlertProps {
  status: StatusType;
  type: "store" | "service" | "product";
  rejectReason?: string;
  isDismissed?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function PreviewStatusAlert({
  status,
  type,
  rejectReason,
  isDismissed,
  onDismiss,
  className,
}: PreviewStatusAlertProps) {
  if (isDismissed) return null;

  const typeLabels = {
    store: {
      approvedTitle: "تم قبول متجرك بنجاح",
      approvedBody: "نحيطك علماً بأنه تم قبول عرض متجرك على الموقع، وهو الآن متاح للزوار ويمكن للعملاء تصفحه في أي وقت.",
      rejectedTitle: "تم رفض المتجر",
      pendingTitle: "المتجر قيد المراجعة من قبل فريق أعطيني",
      pendingBody: "سيتم نشر المتجر بعد الانتهاء من مراجعته واعتماده من قبل الإدارة.",
    },
    service: {
      approvedTitle: "تم قبول خدمتك بنجاح",
      approvedBody: "نحيطك علماً بأنه تم قبول عرض خدمتك على الموقع، وهي الآن متاحة للزوار ويمكن للعملاء طلبها في أي وقت.",
      rejectedTitle: "تم رفض الخدمة",
      pendingTitle: "الخدمة قيد المراجعة من قبل فريق أعطيني",
      pendingBody: "سيتم نشر الخدمة بعد الانتهاء من مراجعتها واعتمادها من قبل الإدارة.",
    },
    product: {
      approvedTitle: "تم قبول منتجك بنجاح",
      approvedBody: "نحيطك علماً بأنه تم قبول عرض منتجك على الموقع، وهو الآن متاح للزوار ويمكن للعملاء طلبه في أي وقت.",
      rejectedTitle: "تم رفض المنتج",
      pendingTitle: "المنتج قيد المراجعة من قبل فريق أعطيني",
      pendingBody: "سيتم نشر المنتج بعد الانتهاء من مراجعته واعتماده من قبل الإدارة.",
    },
  };

  const labels = typeLabels[type];

  let alertConfig = null;

  if (status === "approved") {
    alertConfig = {
      icon: null, // No icon in the approved state based on the screenshot, or maybe a check? Let's use check just in case or keep it clean
      className: "border-[#66FF99]/60 bg-[#E6FFF1]",
      titleClassName: "text-[#006B2E]",
      bodyClassName: "text-[#008A3A]",
      title: labels.approvedTitle,
      body: labels.approvedBody,
    };
  } else if (status === "rejected") {
    alertConfig = {
      icon: <XCircle className="w-5 h-5 text-[#D00739] mt-0.5 shrink-0" />,
      className: "border-[#FF9999]/60 bg-[#FFF0F0]",
      titleClassName: "text-[#D00739]",
      bodyClassName: "text-[#A00028]",
      title: labels.rejectedTitle,
      body: rejectReason
        ? `سبب الرفض: ${rejectReason}`
        : "نعتذر، لم يتم قبول العرض في الوقت الحالي. يرجى مراجعة البيانات وإجراء التعديلات اللازمة، ثم إعادة الإرسال.",
    };
  } else if (status === "pending") {
    alertConfig = {
      icon: <PauseCircle className="w-5 h-5 text-[#C48A00] mt-0.5 shrink-0" />,
      className: "border-[#FFD87D]/60 bg-[#FFFBF0]",
      titleClassName: "text-[#8A6000]",
      bodyClassName: "text-[#6B4A00]",
      title: labels.pendingTitle,
      body: labels.pendingBody,
    };
  } else if (status === "deactivated") {
    alertConfig = {
      icon: <PauseCircle className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />,
      className: "border-gray-200 bg-gray-50",
      titleClassName: "text-gray-700",
      bodyClassName: "text-gray-500",
      title: `لقد قمت بإلغاء تفعيل ${type === 'store' ? 'المتجر' : type === 'service' ? 'الخدمة' : 'المنتج'} مؤقتاً`,
      body: `يمكنك إعادة التفعيل في أي وقت ليظهر للعملاء مرة أخرى.`,
    };
  }

  if (!alertConfig) return null;

  return (
    <div className={cn("w-full px-4 sm:px-6 py-4 rounded-xl border flex items-start gap-3", alertConfig.className, className)} dir="rtl">
      {alertConfig.icon && <div className="shrink-0">{alertConfig.icon}</div>}
      <div className="flex-1">
        <p className={cn("font-bold text-base", alertConfig.titleClassName)}>
          {alertConfig.title}
        </p>
        <p className={cn("text-sm mt-1 leading-relaxed", alertConfig.bodyClassName)}>
          {alertConfig.body}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-800 hover:opacity-70 transition-opacity shrink-0 mt-0.5 mr-auto"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
