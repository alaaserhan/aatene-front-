import { Metadata } from "next";
import UserProfilePage from "@/src/features/(web)/user-profile/components/UserProfilePage";
import { generateDynamicMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generateDynamicMetadata({
    title: "الملف الشخصي",
    description: "عرض الملف الشخصي للمستخدم على منصة أعطيني.",
});

export default function Page() {
    return <UserProfilePage />;
}
