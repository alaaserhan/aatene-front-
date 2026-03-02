import { Metadata } from "next";
import { FollowingsPage } from "@/src/features/(dashboard)/followings/components/FollowingsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardFollowing");

export default function Page() {
  return <FollowingsPage />;
}