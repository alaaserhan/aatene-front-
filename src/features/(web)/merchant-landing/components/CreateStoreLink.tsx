"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useUser } from "@/src/auth";
import { useLanguage } from "@/src/hooks/use-language";
import { merchantSignupPath } from "@/src/auth/links";

type CreateStoreLinkProps = {
    className?: string;
    children: ReactNode;
};

/**
 * Guests register as merchants first and land on store creation afterwards;
 * customer accounts have to convert to a merchant account in settings before
 * the dashboard lets them in.
 */
export default function CreateStoreLink({ className, children }: CreateStoreLinkProps) {
    const lang = useLanguage();
    const user = useUser();
    const createStorePath = `/${lang}/admin/stores/add`;

    let href = merchantSignupPath(lang);
    if (user?.user_type === "client") href = `/${lang}/settings?tab=merchant`;
    else if (user) href = createStorePath;

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}
