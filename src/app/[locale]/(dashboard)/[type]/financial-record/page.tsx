import { FinancialRecordPage } from "@/src/features/(dashboard)/financial/components/FinancialRecordPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "فواتير والسجل المالي",
    description: "سجل المعاملات المالية وتحليل المصروفات",
};

export default function Page() {
    return <FinancialRecordPage />;
}
