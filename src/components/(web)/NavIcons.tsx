"use client";

import React from "react";
import Link from "next/link";
import { ArrowDownUp, Heart, MessageSquare, Store } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useScopedI18n } from "@/src/i18n/provider";

interface NavIconsProps {
  userType?: string;
  currentLocale: string;
}

export function NavIcons({ userType, currentLocale }: NavIconsProps) {
  const t = useScopedI18n('navbar');

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/${currentLocale}/compare`} title={t('compare')} aria-label={t('compare')}>
            <ArrowDownUp className="h-5 w-5" />
        </Link>
      </Button>

      {userType === "admin" && (
         <Button variant="ghost" size="icon" asChild>
            <Link href={`/${currentLocale}/admin/stores`} title={t('admin_stores')} aria-label={t('admin_stores')}>
                <Store className="h-5 w-5" />
            </Link>
         </Button>
      )}

      <Button variant="ghost" size="icon" asChild>
        <Link href={`/${currentLocale}/favourites`} title={t('favourites')} aria-label={t('favourites')}>
            <Heart className="h-5 w-5" />
        </Link>
      </Button>

       <Button variant="ghost" size="icon" asChild>
        <Link href={`/${currentLocale}/chat`} title={t('chat')} aria-label={t('chat')}>
            <MessageSquare className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}