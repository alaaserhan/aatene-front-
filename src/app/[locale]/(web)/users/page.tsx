import { Suspense } from "react";
import type { Metadata } from "next";
import SearchPage from "@/src/features/(web)/search/components/SearchPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("users");

export default function UsersPage() {
    return (
        <Suspense fallback={null}>
            <SearchPage type="users" />
        </Suspense>
    );
}
