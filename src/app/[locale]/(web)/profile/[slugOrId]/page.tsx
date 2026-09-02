import { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import UserProfilePage from "@/src/features/(web)/user-profile/components/UserProfilePage";
import type { UserProfile } from "@/src/features/(web)/user-profile/types";
import {
    getUserProfileCached,
    getUserProfilePageDataCached,
} from "@/src/features/(web)/user-profile/server";
import { USER_PROFILE_KEYS } from "@/src/features/(web)/user-profile/hooks";
import {
    generateDynamicMetadata,
    generateAlternates,
    toPlainText,
    SITE_URL,
} from "@/src/lib/seo.config";
import { makeQueryClient } from "@/src/lib/queryClient";

type PageProps = {
    params: Promise<{ locale: string; slugOrId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slugOrId } = await params;
    const data = await getUserProfileCached(slugOrId);
    const user = data?.user;

    if (!user) {
        return generateDynamicMetadata({
            title: "الملف الشخصي",
            description: "عرض الملف الشخصي للمستخدم على منصة أعطيني.",
        });
    }

    return {
        ...generateDynamicMetadata({
            title: user.fullname,
            description:
                toPlainText(user.bio) || `تصفح الملف الشخصي لـ ${user.fullname} على منصة أعطيني.`,
            image: user.avatar_url || user.cover_url || undefined,
            url: `${SITE_URL}/${locale}/profile/${user.slug || slugOrId}`,
        }),
        alternates: generateAlternates(locale, `/profile/${user.slug || slugOrId}`),
    };
}

function buildProfileJsonLd(user: UserProfile, locale: string) {
    // Deliberately excludes email/phone — those are personal contact details and
    // must not be published in structured data.
    return {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        url: `${SITE_URL}/${locale}/profile/${user.slug}`,
        mainEntity: {
            "@type": "Person",
            name: user.fullname,
            ...(user.bio && { description: toPlainText(user.bio, 5000) }),
            ...(user.avatar_url && { image: user.avatar_url }),
            ...(user.city?.name && {
                address: { "@type": "PostalAddress", addressLocality: user.city.name },
            }),
        },
    };
}

export default async function ProfilePage({ params }: PageProps) {
    const { locale, slugOrId } = await params;

    const [profile, pageData] = await Promise.all([
        getUserProfileCached(slugOrId),
        getUserProfilePageDataCached(slugOrId),
    ]);

    if (!profile?.user) {
        notFound();
    }

    const queryClient = makeQueryClient();
    queryClient.setQueryData(USER_PROFILE_KEYS.detail(slugOrId), profile);
    if (pageData) {
        queryClient.setQueryData(USER_PROFILE_KEYS.pageData(slugOrId), pageData);
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(buildProfileJsonLd(profile.user, locale)),
                }}
            />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <UserProfilePage />
            </HydrationBoundary>
        </>
    );
}
