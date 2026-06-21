import { Metadata } from "next";
import UserProfilePage from "@/src/features/(web)/user-profile/components/UserProfilePage";
import { generateDynamicMetadata } from "@/src/lib/seo.config";

// TODO: replace static metadata with generateMetadata() — fetch user profile by slugOrId and use
// generateDynamicMetadata({ title: user.name, description: user.bio, image: user.avatar })
export const metadata: Metadata = generateDynamicMetadata({
    title: "الملف الشخصي",
    description: "عرض الملف الشخصي للمستخدم على منصة أعطيني.",
});

// TODO: convert to ISR (export const revalidate = 60) — UserProfilePage is fully client-side
// Plan: prefetch user profile server-side via React Query HydrationBoundary,
// and slim UserProfilePage down to a thin client shell (composition pattern).
export default function Page() {
    return <UserProfilePage />;
}
